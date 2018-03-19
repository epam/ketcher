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
const plugins = require('gulp-load-plugins')();

const browserify = require('browserify');
const source = require('vinyl-source-stream');
const istanbul = require('browserify-babel-istanbul');

const fs = require('fs');

module.exports.testRender = function (options) {
	return browserify({
		entries: options.entry,
		debug: true,
		transform: [
			['babelify', {
				presets: [
					['env', {
						'targets': { 'node': '8.10' },
						'useBuiltIns': true
					}],
				]
			}],
			istanbul,
			['exposify', {
				expose: {
					raphael: 'Raphael',
					resemblejs: 'resemble'
				}
			}]
		]
	}).bundle()
		.pipe(source('render-test.js'))
		.pipe(plugins.header(fs.readFileSync(options.banner, 'utf8')))
		.pipe(gulp.dest('./test/dist'));
};

module.exports.testIO = function () {
	const paths = [
		'/chem/struct',
		'/chem/molfile',
		'/util',
		'/chem'
	];

	paths.forEach((item) => {
		gulp.src(`src/script${item}/**.*`)
			.pipe(plugins.babel({
				presets: [
					['env', {
						'targets': { 'node': '8.10'	},
						'useBuiltIns': true
					}],
				]
			}))
			.pipe(gulp.dest(`./test/dist/io${item}`));
	});
};
