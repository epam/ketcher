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
var ora = require('ora');
var tap = require('tap');
var istanbul = require('istanbul');

var libSymbol = require('../utils/library');
var cols = require('../utils/collections')();
var browserSession = require('../utils/browser-session');

browserSession((browser, testDir) => {
	browser = browser.url(`${testDir}/render/render-test.html`);

	for (let colname of cols.names()) {
		tap.test(colname, t => {
			for (let name of cols(colname).names()) {
				let sampleName = `${colname}/${name}`;

				let structStr = cols(colname).fixture(name);
				let symbol = libSymbol(sampleName);  // string Symbol element from `fixtures.svg`

				let opts = {
					sample: sampleName,
					width: 600,
					height: 400
				};

				let spinner = ora(sampleName);
				browser.then(() => spinner.start());

				browser = browser
					.execute(function (structStr, symbol, opts) {
						window.compareTest(structStr, symbol, opts);
					}, structStr, symbol, opts)
					.waitForExist('#cmp')
					.getHTML('#cmp', false).then(mismatch => {
						mismatch = mismatch.replace(/Mismatch:\s/, '') - 0;
						spinner.succeed(`${sampleName} - ${mismatch}`);
						t.ok(mismatch < 0.5, `${sampleName}`);
					});
			}
			browser.then(() => t.end());
		});
	}

	return browser.then(() => {
		return browser.execute('return window.__coverage__').then(cover => {
			var reporter = new istanbul.Reporter();
			var collector = new istanbul.Collector();
			collector.add(cover.value);
			reporter.add('html'); // istanbul.Report.getReportList()
			reporter.write(collector, true, () => null);
		});
	});
});
