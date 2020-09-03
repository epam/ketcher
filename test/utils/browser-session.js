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
const webdriverio = require('webdriverio');
const chromedriver = require('chromedriver');
const path = require('path');
const minimist = require('minimist');

const options = minimist(process.argv.slice(2), {
	string: ['dist'],
	boolean: ['headless'],
	default: {
		headless: implicitHeadless(),
		dist: 'dist'
	}
});
const headlessOpts = {
  // see: https://goo.gl/ypWDst
  args: ['--headless', '--disable-gpu']
};

function implicitHeadless() {
	return process.platform != 'win32' && process.platform != 'darwin' &&
		!process.env.DISPLAY;
}

async function startSession(session) {
	// an variant of https://git.io/vQ8o7
	chromedriver.start(['--url-base=wd/hub']);

	const browser = await webdriverio.remote({
		port: 9515, // TODO: autochoose choose unused port
    path: '/wd/hub',
    logLevel: 'warn',
		capabilities: {
			browserName: 'chrome',
			'goog:chromeOptions': options.headless ? headlessOpts : {}
		}
	});

	await session(browser, path.join(__dirname, '..'));
	await browser.deleteSession();
  return chromedriver.stop();
}

module.exports = startSession;
