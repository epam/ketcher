/****************************************************************************
 * Copyright 2018 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
