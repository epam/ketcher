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
const gulp = require('gulp');
const budo = require('budo');

const cp = require('child_process');
const createBundleConfig = require('./utils').createBundleConfig;

module.exports = function (options, cb) {
	const bundleConfig = createBundleConfig(options);
	const server = budo(`${bundleConfig.entries}:${options.pkg.name}.js`, {
		dir: options.dist,
		browserify: bundleConfig,
		stream: process.stdout,
		host: '0.0.0.0',
		live: true,
		watchGlob: `${options.dist}/*.{html,css}`,
		staticOptions: {
			index: 'ketcher.html'
		}
	}).on('exit', cb);

	gulp.watch('src/style/**.less', gulp.series('style'));
	gulp.watch('src/template/**', gulp.series('html'));
	gulp.watch('doc/**', gulp.series('help'));
	gulp.watch(['gulpfile.js', 'package.json'], function () {
		server.close();
		cp.spawn('gulp', process.argv.slice(2), {
			stdio: 'inherit'
		});
		process.exit(0);
	});

	return server;
};
