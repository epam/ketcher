/* jshint node: true */
/* eslint-disable */

module.exports = function (grunt) {
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		options: {
			banner: grunt.file.read('script/banner.js'),
			src: ['script/**', 'style/**', 'icons/**',
			      'template/**', 'Gruntfile.js', 'package.json',
			      '.jshintrc', '.editorconfig'],
			libs: ['prototype-min.js', 'raphael-min.js'],
			build: ['<%= browserify.default.dest %>',
			        '<%= less.default.dest %>',
			        '<%= assemble.default.dest %>',
			        '<%= pkg.name %>.{svg,ttf,eot,woff}'],
			distrib: ['LICENSE', 'favicon.ico', 'logo.jpg',
			          'demo.html', 'templates.sdf'],
			server: 'server/ketcher.py',

			pkg: '<%= pkg %>',

			// build options
			// is there a way to automate?
			'build-number': grunt.option('build-number'),
			'build-date': grunt.option('build-date') ||
				          grunt.option('build-number') && grunt.template.today('yyyy-mm-dd HH-MM-ss'),

			'no-generics': grunt.option('no-generics'),
			'no-reactions': grunt.option('no-reactions'),
			'no-sgroup': grunt.option('no-sgroup'),
			'no-rgroup': grunt.option('no-rgroup') || grunt.option('rgroup-label-only'),
			'rgroup-label-only': grunt.option('rgroup-label-only')
		},

		browserify: {
			options: {
				banner: '<%= options.banner %>',
				transform: [
					[
						'browserify-replace', {
							replace: [
								{from: /__TIME_CREATED__/, to: (new Date()).toString()}
							]
						}
					]
				]
			},
			dev: {
				options: {
					browserifyOptions: {
						debug: true
					}
				},
				files: {
					'dist/<%= pkg.name %>.js': ['script/index.js']
				}
			},
			default: {
				options: {
					transform: [
						[
							'<%= browserify.options.transform %>',
							'uglifyify', {
								report: 'min',
								compress: {
									global_defs: {
										DEBUG: false
									},
									dead_code: true
								}
							}
						]
					]
				},
				files: '<%= browserify.dev.files %>'
			}
		},

		less: {
			default: {
				options: {
					cleancss: true,
					report: 'min'
				},
				src: 'style/main.less',
				dest: 'dist/<%= pkg.name %>.css'
			},
			dev: {
				files: ['<%= less.default %>']
			}
		},

		assemble: {
			default: {
				options: {
					partials: ['template/menu/*',
					           'template/dialog/*'],
					options: '<%= options %>',
					postprocess: require('pretty')
				},

				src: 'template/main.hbs',
				dest: 'dist/<%= pkg.name %>.html'
			}
		},

		fontello: {
			options: {
				config  : 'icons/config.json',
				fonts   : 'dist',
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
			libs: {
				expand: true,
				cwd: 'script/vendor',
				src: ['<%= options.libs %>'],
				dest: 'dist'
			},
			raphael: {
				expand: true,
				flatten: true,
				src: require.resolve('raphael/raphael-min.js'),
				dest: 'dist'
			},
			// TODO: find better place to store static
			static: {
				expand: true,
				src: ['<%= options.distrib %>'],
				dest: 'dist'
			},
			'svg-fix': {
				expand: true,
				cwd: '.tmp',
				src: ['<%= pkg.name %>.{svg,ttf}'],
				dest: 'dist'
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
						cwd: 'dist',
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
			all: ['dist', '<%= pkg.name %>*.zip'],
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

		watch: {
			options: {
				atBegin: true
			},
			js: {
				files: 'script/**/*.js',
				tasks: 'browserify:dev'
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
				files: 'dist/**'
			}
		}
	});

	function patchVersionRev (err, stdout, _, cb) {
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
	grunt.registerTask('default', ['shell:rev', 'clean', 'less:default',
	                               'fontello', 'browserify:default', 'assemble',
	                               'copy', 'compress', 'clean:tmp']);
	grunt.registerTask('dev', ['shell:rev', 'clean', 'less:dev', 'fontello',
	                           'browserify:dev', 'assemble', 'copy', 'clean:tmp']);
};
