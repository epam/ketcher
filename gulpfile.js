var gulp = require('gulp');
var gutil = require('gulp-util');
var plugins = require('gulp-load-plugins')();

var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');

var cp = require('child_process');
var del = require('del');
var minimist = require('minimist');

var pkg = require('./package.json');
var options = minimist(process.argv.slice(2), {
	string: ['dist', 'api-path', 'build-number', 'build-date'],
	boolean: ['sgroup-data-special'],
	default: {
		'dist': 'dist',
		'api-path': '',
		'build-number': '',
		'build-date': new Date() // TODO: format me
	}
});

// banner: grunt.file.read('script/banner.js'),
var polyfills = ['html5shiv', 'es5-shim', 'es6-shim',
                 'es7-shim/dist/es7-shim'];

var distrib = ['LICENSE', 'favicon.ico', 'logo.jpg',
               'demo.html', 'templates.sdf'];

gulp.task('script', ['patch-version'], function() {
	return scriptBundle('script/index.js')
		// Don't transform, see: http://git.io/vcJlV
		.pipe(source('ketcher.js')).pipe(buffer())
		.pipe(plugins.sourcemaps.init({ loadMaps: true }))
		.pipe(plugins.uglify({
			compress: {
				global_defs: {
					DEBUG: false
				},
				dead_code: true
		}}))
		.pipe(plugins.sourcemaps.write('./'))
		.pipe(gulp.dest(options.dist));
});

gulp.task('script-watch', ['patch-version'], function () {
	return scriptBundle('script/index.js', function (bundle) {
		return bundle.pipe(source('ketcher.js'))
			.pipe(gulp.dest(options.dist))
			.pipe(plugins.livereload());
	});
});

gulp.task('style', function () {
	return gulp.src('style/index.less')
		.pipe(plugins.sourcemaps.init())
		.pipe(plugins.less({ paths: ['node_modules'] }))
	    // don't use less plugins due http://git.io/vqVDy bug
		.pipe(plugins.autoprefixer({ browsers: ['> 0.5%'] }))
		.pipe(plugins.minifyCss())
		.pipe(plugins.sourcemaps.write('./'))
		.pipe(gulp.dest('dist'))
		.pipe(plugins.livereload());
});

gulp.task('patch-version', function (cb) {
	if (pkg.rev)
		return cb();
	cp.exec('git rev-list ' + pkg.version + '..HEAD --count', function (err, stdout, _) {
		if (err && err.code != 127) // not "command not found"
			gutil.log('Could not fetch revision. ' +
			          'Please git tag the package version.');
		else if (!err && stdout > 0) {
			pkg.rev =  stdout.toString().trim();
			pkg.version += ('+r' + pkg.rev);
		}
		cb(err);
	});
});

gulp.task('clean', function () {
	return del('dist/*');
});

gulp.task('reload', function() {
	cp.spawn('gulp', ['watch'], { stdio: 'inherit' });
	process.exit();
});

gulp.task('watch', ['assets', 'style', 'script'], function() {
	plugins.livereload.listen();
	// gulp.watch('style/**.less', ['style']);
	gulp.watch('script/**.js', ['script']);
	// gulp.watch('index.html', ['html']);
	gulp.watch(['gulpfile.js', 'package.json'], ['reload']);
});


function scriptBundle(src, watchUpdate) {
	var build = browserify(src, {
		standalone: pkg.name,
		cache: {}, packageCache: {},
		debug: true
	});
	build.transform('exposify', { expose: {'raphael': 'Raphael' }})
		.transform('browserify-replace', { replace: [
			{ from: '__VERSION__', to: pkg.version },
			{ from: '__API_PATH__', to: options['api-path'] },
			{ from: '__BUILD_NUMBER__', to: options['build-number'] },
			{ from: '__BUILD_DATE__', to: options['build-date'] },
		]});

	polyfillify(build);
	if (!watchUpdate)
		return build.bundle();

	var rebuild = function () {
		return watchUpdate(build.bundle().on('error', function (err) {
			gutil.log(err.message);
		}));
	};
	build.plugin(watchify);
	build.on('log', gutil.log.bind(null, 'Script update:'));
	build.on('update', rebuild);
	return rebuild();
}

function polyfillify(build) {
	var fs = require('fs');
	var through = require('through2');
	build.on('bundle', function() {
		var firstChunk = true;
		var polyfillData = polyfills.reduce(function (res, module) {
			var data = fs.readFileSync(require.resolve(module));
			return res + data + '\n';
		}, '');
		var stream = through.obj(function (buf, enc, next) {
			if (firstChunk) {
				this.push(polyfillData);
				firstChunk = false;
			}
			this.push(buf);
			next();
		});
		stream.label = "prepend";
		build.pipeline.get('wrap').push(stream);
	});
}

gulp.task('default', ['clean', 'style', 'script']);
