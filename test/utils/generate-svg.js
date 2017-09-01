/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

/* eslint-env node */

var fs = require('fs');

var ora = require('ora');
var svgstore = require('svgstore');

var cols = require('./collections')();
var browserSession = require('./browser-session');

browserSession((browser, testDir) => {
	browser = browser.url(`${testDir}/render/render-test.html`);

	var sprites = svgstore({
		copyAttrs: ['width', 'height', 'preserveAspectRatio']
	});

	for (var colname of cols.names()) {
		for (var name of cols(colname).names()) {
			let sampleName = `${colname}/${name}`;
			let structStr = cols(colname).fixture(name);

			let opts = {
				sample: sampleName,
				width: 600,
				height: 400
			};
			let spinner = ora(sampleName);
			browser.then(() => spinner.start());
			browser = browser
				.execute(function (structStr, opts) {
					window.renderTest(structStr, opts);
				}, structStr, opts)
				.waitForExist('#canvas-ketcher')
				.getHTML('#canvas-ketcher', false).then(svg => {
					// console.info(sampleName, svg.replace(/.*(viewBox=".+?").*/, "$1"));
					sprites.add(sampleName, svg);
					spinner.succeed();
				});
		}
	}
	return browser.then(() => {
		// TODO should it be cmd arg?
		fs.writeFileSync('test/fixtures/fixtures.svg', sprites);
	});
});
