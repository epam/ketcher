/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

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
