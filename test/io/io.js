#!/usr/bin/nodejs
/* eslint-env node */

const path = require('path');
const tap = require('tap');

require('babel-polyfill'); // Needed for padStart, etc (used in "new wave" ketchers)

const molfile = require(path.join('../..', 'script/chem/molfile'));

const cols = require('../utils/collections')();

const molcompare = require('../utils/molcompare');

function isEquals(expected, actual) {
	return molcompare.raw(expected, actual, { stripSpaces: true });
}

function runTests(isEqual) {
	for (let colname of cols.names()) {
		tap.test(colname, tap => {
			for (let sample of cols(colname)) {
				let expected = sample.data;

				let struct = molfile.parse(sample.data, { badHeaderRecover: true });
				let actual = molfile.stringify(struct);

				if (!expected || !actual)
					tap.fail(`${colname}/${sample.name} not parsed`);
				try {
					tap.ok(isEqual(expected, actual), `${colname}/${sample.name} equals`);
				} catch (e) {
					tap.fail(`${colname}/${sample.name} mismatch`, e);
				}
			}
			tap.end();
		});
	}
}

runTests(isEquals);
