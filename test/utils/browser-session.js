/* eslint-env node */

var webdriverio = require('webdriverio');
var chromedriver = require('chromedriver');

var path = require('path');
var minimist = require('minimist');

var options = minimist(process.argv.slice(2), {
	string: ['dist'],
	boolean: ['headless'],
	default: {
		headless: implicitHeadless(),
		dist: 'dist'
	}
});

function implicitHeadless() {
	return process.platform != 'win32' && process.platform != 'darwin' &&
		!process.env.DISPLAY;
}

function startSession(session) {
	// an variant of https://git.io/vQ8o7
	chromedriver.start(['--url-base=wd/hub']);

	var browser = webdriverio.remote({
		port: 9515, // TODO: autochoose choose unused port
		desiredCapabilities: {
			browserName: 'chrome',
			chromeOptions: options.headless ? {
				// see: https://goo.gl/ypWDst
				args: ['--headless', '--disable-gpu']
			} : {}
		}
	}).init().url('about:blank');

	browser.on('error', (e) => console.error(e));

	let br = session(browser, path.join(__dirname, '..')) || browser; // test dir
	br.end().then(() => chromedriver.stop());
}

module.exports = startSession;
