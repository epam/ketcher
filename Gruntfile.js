module.exports = function (grunt) {
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		options: {
			src: ['script/**', 'style/**', 'icons/**',
			      'template/**', 'Gruntfile.js', 'package.json',
			      '.jshintrc', '.editorconfig'],

			build: ['<%= less.default.dest %>',
			        '<%= assemble.default.dest %>',
			        '<%= pkg.name %>.{svg,ttf,eot,woff}'],
			distrib: ['LICENSE', 'favicon.ico', 'logo.jpg',
			          'demo.html', 'templates.sdf'],
			server: 'server/ketcher.py',

			pkg: '<%= pkg %>',

			// build options
			// is there a way to automate?
			'dist': grunt.option('dist') || 'dist',
			'build-number': grunt.option('build-number'),
			'build-date': grunt.option('build-date') ||
				          grunt.template.today('yyyy-mm-dd HH-MM-ss'),

			'api-path': grunt.option('api-path') || '',
			'no-generics': grunt.option('no-generics'),
			'no-reactions': grunt.option('no-reactions'),
			'no-sgroup': grunt.option('no-sgroup'),
			'no-rgroup': grunt.option('no-rgroup') || grunt.option('rgroup-label-only'),
			'rgroup-label-only': grunt.option('rgroup-label-only'),
			'sgroup-data-special': grunt.option('sgroup-data-special') || false

		},

		assemble: {
			default: {
				options: {
					partials: ['template/menu/*',
					           'template/dialog/*'],
					options: '<%= options %>'
					//postprocess: require('pretty')
				},

				src: 'template/main.hbs',
				dest: '<%= options.dist %>/<%= pkg.name %>.html'
			}
		},

		fontello: {
			options: {
				config  : 'icons/config.json',
				fonts   : '<%= options.dist %>',
				styles  : false
			},
			default: {},
			'svg-fix': {
				options: {
					config  : 'icons/config-svg-fix.json',
					fonts   : '.tmp',
					styles  : false
				}
			}
		},

		copy: {
			prototype: {
				expand: true,
				flatten: true,
				src: 'script/prototype.js',
				dest: '<%= options.dist %>'
			},
			raphael: {
				expand: true,
				flatten: true,
				src: require.resolve('raphael/raphael.min.js'),
				dest: '<%= options.dist %>'
			},
			// TODO: find better place to store static
			static: {
				expand: true,
				src: ['<%= options.distrib %>'],
				dest: '<%= options.dist %>'
			},
			'svg-fix': {
				expand: true,
				cwd: '.tmp',
				src: ['<%= pkg.name %>.{svg,ttf}'],
				dest: '<%= options.dist %>'
			}
		},

		jshint: {
			options: {
				jshintrc: 'jshintrc'
			},
			src: {
				src: ['script/**/*.js', '!script/vendor/*.js']
			},
			grunt: {
				src: 'Gruntfile.js'
			}
		},

		compress: {
			options: {
				level: 9
			},
			build: {
				options: {
					archive: '<%= pkg.name %>-<%= pkg.version %>.zip'
				},
				files: [
					{
						expand: true,
						cwd: '<%= options.dist %>',
						src: '**',
						dest: '<%= pkg.name %>-<%= pkg.version %>'
					},
					{
						flatten: true,
						expand: true,
						src: '<%= options.server %>',
						dest: '<%= pkg.name %>-<%= pkg.version %>'
					}
				]
			}
		},

		clean: {
			all: ['<%= options.dist %>', '<%= pkg.name %>*.zip'],
			tmp: '.tmp/**'
		},

		shell: {
			rev: {
				command: 'git rev-list <%= pkg.version %>..HEAD --count',
				options: {
					stdout: false,
					stderr: false,
					callback: patchVersionRev
				}
			}
		},

		githooks: {
			default: {
				'pre-commit': 'check-epam-email'
			}
		},

		watch: {
			options: {
				atBegin: true
			},
			js: {
				files: 'script/**/*.js',
				tasks: ['shell:rev', 'browserify:dev']
			},
			css: {
				files: 'style/**/*.less',
				tasks: 'less:dev'
			},
			html: {
				files: 'template/**',
				tasks: ['shell:rev', 'assemble']
			},
			livereload: {
				options: {
					atBegin: false,
					livereload: true
				},
				files: '<%= options.dist %>/**'
			}
		}
	});

	grunt.registerTask('check-epam-email', 'Checks for epam email', function(arg1, arg2) {
		// TODO: should be pre-push and check remote origin
		var cp = require('child_process');
		try {
			var email = cp.execSync('git config user.email').toString().trim();
			if (!/@epam.com$/.test(email)) {
				grunt.log.error('Email', email, 'is not from EPAM domain.');
				grunt.log.error('To check git project\'s settings run `git config --list`');
				grunt.fatal('Could not continue. Bye!', 3);
			}
		} catch(e) {};
	});

	function patchVersionRev(err, stdout, _, cb) {
		if (err && err.code != 127)  // not "command not found", so git is here
			grunt.log.error('Couldn\'t fetch revision. Please git tag the package version.');
		else if (!err && stdout > 0)
			grunt.config('pkg.version', grunt.config('pkg.version') + ('+r' + stdout).trim());
		cb();
	}

	require('load-grunt-tasks')(grunt);
	// waiting for assemble 0.5.0
	grunt.loadNpmTasks('assemble');

	grunt.registerTask('font', ['fontello', 'clean:tmp']);

	// clean:tmp in the end as workaround rimraf bug
	grunt.registerTask('default', ['shell:rev', 'less:default',
	                               'fontello', 'assemble', 'copy',
	                               'compress', 'clean:tmp']);
	grunt.registerTask('dev', ['shell:rev', 'less:dev',
	                           'fontello', 'assemble', 'copy', 'clean:tmp']);
};
