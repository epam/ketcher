var gulp = require('gulp');
var gutil = require('gulp-util');
var plugins = require('gulp-load-plugins')();

var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var budo = require('budo');
var istanbul = require('browserify-babel-istanbul');

var fs = require('fs');
var cp = require('child_process');
var del = require('del');
var minimist = require('minimist');
var MarkdownIt = require('markdown-it');

var pkg = require('./package.json');
var options = minimist(process.argv.slice(2), {
	string: ['dist', 'api-path', 'build-number', 'build-date',
	         'miew-path'],
	boolean: ['sgroup-data-special', 'no-generics', 'no-reactions',
	          'no-sgroup', 'no-rgroup', 'rgroup-label-only'],
	default: {
		'dist': 'dist',
		'api-path': '',
		'miew-path': '',
		'build-number': '',
		'build-date': new Date().toISOString().slice(0, 19)
	}
});

var distrib = ['LICENSE', 'demo.html', 'library.sdf', 'library.svg'];

const createBundleConfig = () => ({
	entries: 'script',
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
				{ from: '__BUILD_DATE__', to: options['build-date'] },
				{ from: '__MIEW_PATH__', to: options['miew-path'] },
			]
		}],
		['babelify', {
			presets: [
				["env", {
					"targets": {
						"browsers": ["last 2 versions", "safari > 8", "chrome > 52"]
					},
					"useBuiltIns": true
				}],
				"react"],
			plugins: [
				'lodash',
				'transform-class-properties',
				'transform-object-rest-spread',
				['transform-react-jsx', { pragma: 'h' }],
				["babel-plugin-transform-builtin-extend", { globals: ["Set", "Map"] }]
			]
		}]
	]
});

var iconfont = null;

gulp.task('script', ['patch-version'], function() {
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
		}}))
		.pipe(plugins.header(fs.readFileSync('script/banner.js', 'utf8')))
		.pipe(plugins.sourcemaps.write('./'))
		.pipe(gulp.dest(options.dist));
});

gulp.task('test-render', function() {
	return browserify({
		entries: 'test/render/render-test.js',
		debug: true,
		transform: [
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
		.pipe(plugins.header(fs.readFileSync('script/banner.js', 'utf8')))
		.pipe(gulp.dest('./test/dist'));
});

gulp.task('style', ['font'], function () {
	return gulp.src('style/index.less')
		.pipe(plugins.sourcemaps.init())
		.pipe(plugins.rename(pkg.name))
		.pipe(plugins.less({
			paths: ['node_modules/normalize.css'],
			modifyVars: iconfont
		}))
	    // don't use less plugins due http://git.io/vqVDy bug
		.pipe(plugins.autoprefixer({ browsers: ['> 0.5%'] }))
		.pipe(plugins.cleanCss({compatibility: 'ie8'}))
		.pipe(plugins.sourcemaps.write('./'))
		.pipe(gulp.dest(options.dist));
});

gulp.task('html', ['patch-version'], function () {
	var hbs = plugins.hb()
	    .partials('template/menu/*.hbs')
	    .partials('template/dialog/*.hbs')
	    .data(Object.assign({ pkg: pkg }, options));
	return gulp.src('template/index.hbs')
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

gulp.task('font', function (cb) {
	return iconfont ? cb() : gulp.src(['icons/*.svg'])
		.pipe(plugins.iconfont({
			fontName: pkg.name,
			formats: ['ttf', 'svg', 'eot', 'woff'],
			timestamp: options['build-date'],
			normalize: true
		}))
		.on('glyphs', function(glyphs) {
			iconfont = glyphReduce(glyphs);
		})
		.pipe(gulp.dest(options.dist));
});

gulp.task('images', function () {
	return gulp.src('images/*')
		.pipe(gulp.dest(options.dist + '/images'));
});

gulp.task('copy', ['images'], function () {
	return gulp.src(['raphael'].map(require.resolve)
	                .concat(distrib))
		.pipe(gulp.dest(options.dist));
});

gulp.task('patch-version', function (cb) {
	if (pkg.rev)
		return cb();
	cp.exec('git rev-list ' + pkg.version + '..HEAD --count', function (err, stdout, stderr) {
		if (err && stderr.toString().search('path not in') > 0) {
			cb(new Error('Could not fetch revision. ' +
			             'Please git tag the package version.'));
		}
		else if (!err && stdout > 0) {
			pkg.rev = stdout.toString().trim();
			options['build-number'] = pkg.rev;
		}
		cb();
	});
});

gulp.task('lint', function () {
	return gulp.src('script/**')
		.pipe(plugins.eslint())
		.pipe(plugins.eslint.format())
		.pipe(plugins.eslint.failAfterError());
});

gulp.task('check-epam-email', function(cb) {
	// TODO: should be pre-push and check remote origin
	try {
		var email = cp.execSync('git config user.email').toString().trim();
		if (/@epam.com$/.test(email)) {
			cb();
		} else {
			cb(new Error('Email ' + email + ' is not from EPAM domain.'));
			gutil.log('To check git project\'s settings run `git config --list`');
			gutil.log('Could not continue. Bye!');
		}
	} catch(e) {};
});

gulp.task('check-deps-exact', function (cb) {
	var semver = require('semver'); // TODO: output corrupted packages
	var allValid = ['dependencies', 'devDependencies'].every(d => {
		var dep = pkg[d];
		return Object.keys(dep).every(name => {
			var ver = dep[name];
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
	var an = pkg.name + '-' + pkg.version;
	return gulp.src(['**', '!*.map'], { cwd: options.dist })
		.pipe(plugins.rename(function (path) {
			path.dirname = an + '/' + path.dirname;
			return path;
		}))
		.pipe(plugins.zip(an + '.zip'))
		.pipe(gulp.dest('.'));
});

gulp.task('serve', ['clean', 'style', 'html', 'assets'], function(cb) {
	const bundleConfig = createBundleConfig();
	const server = budo(`${bundleConfig.entries}:${pkg.name}.js`, {
		dir: options.dist,
		browserify: bundleConfig,
		stream: process.stdout,
		host: '0.0.0.0',
		live: true,
		watchGlob: `${options.dist}/*.{html,css}`,
		staticOptions: {
			index: `ketcher.html`
		}
	}).on('exit', cb);

	gulp.watch('style/**.less', ['style']);
	gulp.watch('template/**', ['html']);
	gulp.watch('doc/**', ['help']);
	gulp.watch(['gulpfile.js', 'package.json'], function() {
	server.close();
		cp.spawn('gulp', process.argv.slice(2), {
			stdio: 'inherit'
		});
		process.exit(0);
	});

	return server;
});

function markdownify (options) {
	var header = '<!DOCTYPE html>';
	var footer = '';
	var md = MarkdownIt(Object.assign({
		html: true,
		linkify: true,
		typographer: true
	}, options));
	return function process (file) {
		var data = md.render(file.contents.toString());
		file.contents = new Buffer(header + data + footer);
		file.path = gutil.replaceExtension(file.path, '.html');
	};
}

function glyphReduce(glyphs) {
	return glyphs.reduce(function (res, glyph) {
		res['icon-' + glyph.name] = "'" + glyph.unicode[0] + "'";
		return res;
	}, {});
}

gulp.task('pre-commit', ['lint', 'check-epam-email',
                         'check-deps-exact']);
gulp.task('assets', ['copy', 'help']);
gulp.task('code', ['style', 'script', 'html']);
gulp.task('build', ['clean', 'code', 'assets']);
