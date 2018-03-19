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
const gutil = require('gulp-util');
const plugins = require('gulp-load-plugins')();

const MarkdownIt = require('markdown-it');
const path = require('path');

module.exports.copy = function (options) {
	const distrib = options.distrib;
	if (options['miew-path'] !== null) {
		const pathToMiew = path.relative(__dirname, options['miew-path']);
		distrib.push(`${pathToMiew}/Miew.min.js`, `${pathToMiew}/Miew.min.css`);
	}

	return gulp.src(['raphael'].map(require.resolve)
		.concat(distrib))
		.pipe(gulp.dest(options.dist));
};

module.exports.help = function (options) {
	return gulp.src(options.src)
		.pipe(plugins.tap(markdownify()))
		.pipe(gulp.dest(options.dist + '/doc'));
};

function markdownify(options) {
	const header = '<!DOCTYPE html>';
	const footer = '';
	const md = MarkdownIt(Object.assign({
		html: true,
		linkify: true,
		typographer: true
	}, options));
	return function process(file) {
		const data = md.render(file.contents.toString());
		file.contents = new Buffer(header + data + footer);
		file.path = gutil.replaceExtension(file.path, '.html');
	};
}
