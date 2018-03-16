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

/* eslint-disable */
const gulp = require('gulp');
const gutil = require('gulp-util');
const plugins = require('gulp-load-plugins')();

const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const budo = require('budo');
const istanbul = require('browserify-babel-istanbul');

const path = require('path');
const fs = require('fs');
const cp = require('child_process');
const del = require('del');
const minimist = require('minimist');
const MarkdownIt = require('markdown-it');

const pkg = require('./package.json');

const options = minimist(process.argv.slice(2), {
	string: ['dist', 'api-path', 'build-number', 'build-date',
	         'miew-path'],
	boolean: ['sgroup-data-special', 'no-generics', 'no-reactions',
	          'no-sgroup', 'no-rgroup', 'rgroup-label-only'],
	default: {
		'dist': 'dist',
		'api-path': '',
		'miew-path': null,
		'build-number': '',
		'build-date': new Date().toISOString().slice(0, 19)
	}
});

const distrib = ['LICENSE', 'src/template/demo.html', 'src/tmpl_data/library.sdf', 'src/tmpl_data/library.svg'];

const createBundleConfig = () => ({
	entries: 'src/script',
	extensions: ['.js', '.jsx'],
	debug: true,
	standalone: pkg.name,
	transform: [
		['exposify', {
			expose: { 'raphael': 'Raphael' }
		}],
		['browserify-replace', {
			replace: [
				{ from: '__VERSION__', to: pkg.version },
				{ from: '__API_PATH__', to: options['api-path'] },
				{ from: '__BUILD_NUMBER__', to: options['build-number'] },
				{ from: '__BUILD_DATE__', to: options['build-date'] }
			]
		}],
		['babelify', {
			presets: [
				['env', {
					'targets': {
						'browsers': ['last 2 versions', 'safari > 8', 'chrome > 52']
					},
					'useBuiltIns': true
				}],
				'react'],
			plugins: [
				'lodash',
				'transform-class-properties',
				'transform-object-rest-spread',
				['transform-react-jsx', { pragma: 'h' }],
				['transform-builtin-extend', { globals: ['Set', 'Map'] }]
			]
		}]
	]
});

gulp.task('script', ['patch-version'], function () {
	const bundleConfig = createBundleConfig();
	bundleConfig.transform.push(
		['loose-envify', {
			NODE_ENV: 'production',
			global: true
		}]
	);
	return browserify(bundleConfig).bundle()
		// Don't transform, see: http://git.io/vcJlV
		.pipe(source(`${pkg.name}.js`)).pipe(buffer())
		.pipe(plugins.sourcemaps.init({ loadMaps: true }))
		.pipe(plugins.uglify({
			compress: {
				global_defs: {
					DEBUG: false
				},
				dead_code: true
			}
		}))
		.pipe(plugins.header(fs.readFileSync('src/script/util/banner.js', 'utf8')))
		.pipe(plugins.sourcemaps.write('./'))
		.pipe(gulp.dest(options.dist));
});

gulp.task('test-render', function () {
	return browserify({
		entries: 'test/render/render-test.js',
		debug: true,
		transform: [
			['babelify', {
				presets: [
					['env', {
						'targets': { 'node': '8.10'	},
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
		.pipe(plugins.header(fs.readFileSync('src/script/util/banner.js', 'utf8')))
		.pipe(gulp.dest('./test/dist'));
});

gulp.task('test-io', function () {
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
});

gulp.task('style', ['icons-svg'], function () {
	return gulp.src('src/style/index.less')
		.pipe(plugins.sourcemaps.init())
		.pipe(plugins.rename(pkg.name))
		.pipe(plugins.less({
			paths: ['node_modules/normalize.css']
		}))
	    // don't use less plugins due http://git.io/vqVDy bug
		.pipe(plugins.autoprefixer({ browsers: 'last 2 versions' }))
		.pipe(plugins.cleanCss())
		.pipe(plugins.sourcemaps.write('./'))
		.pipe(gulp.dest(options.dist));
});

gulp.task('icons-svg', function () {
	return gulp.src(['src/icons/*.svg'])
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
});

gulp.task('html', ['patch-version'], function () {
	const hbs = plugins.hb()
	    .data(Object.assign({ pkg: pkg, miew: options['miew-path'] !== null }, options));
	return gulp.src('src/template/index.hbs')
		.pipe(hbs)
		.pipe(plugins.rename('ketcher.html'))
		.pipe(gulp.dest(options.dist));
});

gulp.task('doc', function () {
	return gulp.src('doc/*.{png, jpg, gif}')
		.pipe(gulp.dest(options.dist + '/doc'));
});

gulp.task('help', ['doc'], function () {
	return gulp.src('doc/help.md')
		.pipe(plugins.tap(markdownify()))
		.pipe(gulp.dest(options.dist + '/doc'));
});

gulp.task('logo', function () {
	return gulp.src('src/logo/*')
		.pipe(gulp.dest(options.dist + '/logo'));
});

gulp.task('copy', ['logo'], function () {
	if (options['miew-path'] !== null) {
		const pathToMiew = path.relative(__dirname, options['miew-path']);
		distrib.push(`${pathToMiew}/Miew.min.js`, `${pathToMiew}/Miew.min.css`);
	}

	return gulp.src(['raphael'].map(require.resolve)
		.concat(distrib))
		.pipe(gulp.dest(options.dist));
});

gulp.task('patch-version', function (cb) {
	if (pkg.rev) return cb();
	cp.exec('git rev-list ' + pkg.version + '..HEAD --count', function (err, stdout, stderr) {
		if (err && stderr.toString().search('path not in') > 0) {
			cb(new Error('Could not fetch revision. ' +
			             'Please git tag the package version.'));
		} else if (!err && stdout > 0) {
			pkg.rev = stdout.toString().trim();
			options['build-number'] = pkg.rev;
		}
		cb();
	});
});

gulp.task('lint', function () {
	return gulp.src('src/script/**')
		.pipe(plugins.eslint())
		.pipe(plugins.eslint.format())
		.pipe(plugins.eslint.failAfterError());
});

gulp.task('check-epam-email', function (cb) {
	// TODO: should be pre-push and check remote origin
	try {
		const email = cp.execSync('git config user.email').toString().trim();
		if (/@epam.com$/.test(email)) {
			cb();
		} else {
			cb(new Error('Email ' + email + ' is not from EPAM domain.'));
			gutil.log('To check git project\'s settings run `git config --list`');
			gutil.log('Could not continue. Bye!');
		}
	} catch (e) {}
});

gulp.task('check-deps-exact', function (cb) {
	const semver = require('semver'); // TODO: output corrupted packages
	const allValid = ['dependencies', 'devDependencies'].every((d) => {
		const dep = pkg[d];
		return Object.keys(dep).every((name) => {
			const ver = dep[name];
			return (semver.valid(ver) && semver.clean(ver));
		});
	});
	if (!allValid) {
		cb(new gutil.PluginError('check-deps-exact',
		                         'All top level dependencies should be installed' +
		                         'using `npm install --save-exact` command'));
	} else {
		cb();
	}
});

gulp.task('clean', function () {
	return del.sync([options.dist + '/**', pkg.name + '-*.zip']);
});

gulp.task('archive', ['clean', 'assets', 'code'], function () {
	const an = pkg.name + '-' + pkg.version;
	return gulp.src(['**', '!*.map'], { cwd: options.dist })
		.pipe(plugins.rename(function (path) {
			path.dirname = an + '/' + path.dirname;
			return path;
		}))
		.pipe(plugins.zip(an + '.zip'))
		.pipe(gulp.dest('.'));
});

gulp.task('serve', ['clean', 'style', 'html', 'assets'], function (cb) {
	const bundleConfig = createBundleConfig();
	const server = budo(`${bundleConfig.entries}:${pkg.name}.js`, {
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

	gulp.watch('src/style/**.less', ['style']);
	gulp.watch('src/template/**', ['html']);
	gulp.watch('doc/**', ['help']);
	gulp.watch(['gulpfile.js', 'package.json'], function () {
		server.close();
		cp.spawn('gulp', process.argv.slice(2), {
			stdio: 'inherit'
		});
		process.exit(0);
	});

	return server;
});

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

gulp.task('pre-commit', ['lint', 'check-epam-email', 'check-deps-exact']);
gulp.task('assets', ['copy', 'help']);
gulp.task('code', ['style', 'script', 'html']);
gulp.task('build', ['clean', 'code', 'assets']);
