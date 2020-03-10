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
const minimist = require('minimist');
const pkg = require('./package.json');

const options = minimist(process.argv.slice(2), {
	string: ['dist', 'api-path', 'build-number', 'build-date', 'miew-path'],
	default: {
		'dist': 'dist',
		'api-path': '',
		'miew-path': null,
		'build-number': '',
		'build-date': new Date().toISOString().slice(0, 19)
	}
});

function getTask(path, options) {
	return function(callback) {
		let task = options.expName ? require(path)[options.expName] : require(path);
		return task(options, callback);
	};
}

/*== test ==*/
gulp.task('test-render', getTask('./gulp/tests', {
	expName: 'testRender',
	entry: 'test/render/render-test.js',
	banner: 'src/script/util/banner.js'
}));

gulp.task('test-io', getTask('./gulp/tests', {
	expName: 'testIO'
}));

/*== styles ==*/
gulp.task('icons-svg', getTask('./gulp/style-html', {
	expName: 'iconsSvg',
	src: ['src/icons/*.svg'],
	dist: options.dist
}));

gulp.task('style', gulp.series('icons-svg', getTask('./gulp/style-html', {
	expName: 'style',
	src: 'src/style/index.less',
	pkg: pkg,
	dist: options.dist
})));

/*== version ==*/
gulp.task('patch-version', getTask('./gulp/utils', {
	expName: 'version',
	pkg: pkg
}));

/*== script ==*/
gulp.task('script', gulp.series('patch-version', getTask('./gulp/prod-script', Object.assign({
	expName: 'script',
	pkg: pkg,
	entry: 'src/script',
	banner: 'src/script/util/banner.js'
}, options))));

gulp.task('html', gulp.series('patch-version', getTask('./gulp/style-html', Object.assign({
	expName: 'html',
	src: 'src/template/index.hbs',
	pkg: pkg
}, options))));

/*== assets ==*/
gulp.task('doc', function () {
	return gulp.src('doc/*.{png, jpg, gif}')
		.pipe(gulp.dest(options.dist + '/doc'));
});

gulp.task('help', gulp.series('doc', getTask('./gulp/assets', {
	expName: 'help',
	src: 'doc/help.md',
	dist: options.dist
})));

gulp.task('logo', function () {
	return gulp.src('src/logo/*')
		.pipe(gulp.dest(options.dist + '/logo'));
});

gulp.task('copy', gulp.series('logo', getTask('./gulp/assets', {
	expName: 'copy',
	dist: options.dist,
	'miew-path': options['miew-path'],
	distrib: ['LICENSE', 'src/template/demo.html', 'src/tmpl_data/library.sdf', 'src/tmpl_data/library.svg']
})));

/*== check ==*/
gulp.task('lint', getTask('./gulp/check', {
	expName: 'lint',
	src: 'src/script/**'
}));

gulp.task('check-epam-email', getTask('./gulp/check', {
	expName: 'checkEpamEmail'
}));

gulp.task('check-deps-exact', getTask('./gulp/check', {
	expName: 'checkDepsExact',
	pkg: pkg
}));

gulp.task('clean', getTask('./gulp/clean', {
	dist: options.dist,
	pkgName: pkg.name
}));

gulp.task('pre-commit', gulp.series('lint', 'check-epam-email', 'check-deps-exact'));
gulp.task('assets', gulp.series('copy', 'help'));
gulp.task('code', gulp.series('style', 'script', 'html'));

/*== dev ==*/
gulp.task('serve', gulp.series('clean', 'style', 'html', 'assets', getTask('./gulp/dev-script', Object.assign({
	entry: 'src/script',
	pkg: pkg
}, options))));
/*== production ==*/
gulp.task('build', gulp.series('clean', 'code', 'assets'));
gulp.task('archive', gulp.series('build', getTask('./gulp/prod-script', {
	expName: 'archive',
	pkg: pkg,
	dist: options.dist
})));
