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
const buffer = require('vinyl-buffer');

const fs = require('fs');
const createBundleConfig = require('./utils').createBundleConfig;

module.exports.script = function (options) {
	const bundleConfig = createBundleConfig(options);
	bundleConfig.transform.push(
		['loose-envify', {
			NODE_ENV: 'production',
			global: true
		}]
	);
	return browserify(bundleConfig).bundle()
	// Don't transform, see: http://git.io/vcJlV
		.pipe(source(`${options.pkg.name}.js`)).pipe(buffer())
		.pipe(plugins.sourcemaps.init({ loadMaps: true }))
		.pipe(plugins.uglify({
			compress: {
				global_defs: {
					DEBUG: false
				},
				dead_code: true
			}
		}))
		.pipe(plugins.header(fs.readFileSync(options.banner, 'utf8')))
		.pipe(plugins.sourcemaps.write('./'))
		.pipe(gulp.dest(options.dist));
};

module.exports.archive = function (options) {
	const pkg = options.pkg;
	const an = pkg.name + '-' + pkg.version;
	return gulp.src(['**', '!*.map'], { cwd: options.dist })
		.pipe(plugins.rename(function (path) {
			path.dirname = an + '/' + path.dirname;
			return path;
		}))
		.pipe(plugins.zip(an + '.zip'))
		.pipe(gulp.dest('.'));
};
