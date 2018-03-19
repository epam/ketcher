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

module.exports.iconsSvg = function (options) {
	return gulp.src(options.src)
		.pipe(plugins.svgSprite({
			shape: {
				id: { generator: "icon-" }
			},
			svg: { xmlDeclaration: false },
			mode: {
				symbol: { dest: './' }
			}
		}))
		.pipe(plugins.rename('ketcher.svg'))
		.pipe(gulp.dest(options.dist));
};

module.exports.style = function (options) {
	return gulp.src(options.src)
		.pipe(plugins.sourcemaps.init())
		.pipe(plugins.rename(options.pkg.name))
		.pipe(plugins.less({
			paths: ['node_modules/normalize.css']
		}))
		// don't use less plugins due http://git.io/vqVDy bug
		.pipe(plugins.autoprefixer({ browsers: 'last 2 versions' }))
		.pipe(plugins.cleanCss())
		.pipe(plugins.sourcemaps.write('./'))
		.pipe(gulp.dest(options.dist));
};

module.exports.html = function (options) {
	const hbs = plugins.hb()
		.data(Object.assign({ pkg: options.pkg, miew: options['miew-path'] !== null }, options));
	return gulp.src(options.src)
		.pipe(hbs)
		.pipe(plugins.rename('ketcher.html'))
		.pipe(gulp.dest(options.dist));
};
