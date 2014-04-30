/* jshint node: true */

module.exports = function(grunt) {
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		options: {
			banner: grunt.file.read('script/banner.js'),
			src: ['script/**', 'style/**', 'icons/**',
			      'template/**', 'Gruntfile.js', 'package.json',
			      '.jshintrc', '.editorconfig'],
			libs: ['prototype-min.js', 'raphael.js'],
			build: ['<%= concat.default.dest %>',
			        '<%= less.default.dest %>',
			        '<%= assemble.default.dest %>',
			        '<%= pkg.name %>.{svg,ttf,eot,woff}'],
			distrib: ['LICENSE.GPL', 'favicon.ico', 'logo.jpg',
			          'loading.gif', 'demo.html', 'templates.sdf'],
			server: 'server/python/ketcher.py',

			// build options
			// is there a way to automate?
			'no-reaction': grunt.option('no-reaction'),
			'no-group': grunt.option('no-group')
		},

		concat: {
			default: {  // and the only yet

				options: {
					banner: '<%= options.banner %>',
					stripBanners: true
				},
				src: ['script/vendor/html5shiv.js',
				      'script/vendor/base64.js',
				      'script/vendor/keymaster.js',

				      'script/util/*.js',

				      'script/chem/element.js',
				      'script/chem/struct.js',
				      'script/chem/*.js',

				      'script/rnd/visel.js',
				      'script/rnd/restruct.js',
				      'script/rnd/*.js',

				      'script/ui/*.js',

				      'script/main.js'
				     ],
				dest: '<%= pkg.name %>.js'
			}
		},

		uglify: {
			options: {
				banner: '<%= options.banner %>',
				report: 'min',
				compress: {
					global_defs: {
						DEBUG: false
					},
					dead_code: true
				}
			},
			default: {
				files: ['<%= concat.default %>']
			}
		},

		less: {
			default: {
				options: {
					cleancss: true,
					report: 'min'
				},
				src: 'style/main.less',
				dest: '<%= pkg.name %>.css'
			},
			dev: {
				files: ['<%= less.default %>']
			}
		},

		assemble: {
			default: {
				options: {
					partials: ['template/menu/*',
					           'template/dialogs/*'],
					pkg: '<%= pkg %>',       // extend by options, may be?
					options: '<%= options %>',
					git: '<%= gitinfo.local.branch.current %>',
					postprocess: require('pretty')
				},

				src: 'template/main.hbs',
				dest: 'ketcher.html'
			}
		},

		fontello: {
			options: {
				config  : 'icons/config.json',
				fonts   : '.',
				styles  : '.tmp'
			},
			default: {}
		},

		copy: {
			libs: {
				expand: true,
				cwd: 'script/vendor',
				src: ['<%= options.libs %>'],
				dest: '.'
			}
		},

		jshint: {
			options: {
				jshintrc: '.jshintrc'
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
						src: ['<%= options.build %>', '<%= options.libs %>',
						      '<%= options.distrib %>'],
						dest: '<%= pkg.name %>'
					},
					{
						flatten: true,
						expand: true,
						src: '<%= options.server %>',
						dest: '<%= pkg.name %>'
					}
				]
			},
			build_with_sources: {
				options: {
					archive: '<%= pkg.name %>-<%= pkg.version %>-src.zip'
				},
				// TODO: add server parts to source
				src: ['<%= options.build %>', '<%= options.libs %>',
				      '<%= options.distrib %>', '<%= options.src %>'],
				dest: '<%= pkg.name %>'
			}
		},

		clean: {
			all: ['<%= options.libs %>', '<%= options.build %>',
				  '<%= pkg.name %>*.zip'],
			tmp: '.tmp/**'
		},

		gitinfo: {
			commands: {
				'local.branch.current.lastCommitNumber': ['rev-list',
				                                          '--count', 'HEAD']
			}
		},

		watch: {
			options: {
				atBegin: true
			},
			js: {
				files: 'script/**/*.js',
				tasks: 'concat'
			},
			css: {
				files: 'style/**/*.less',
				tasks: 'less:dev'
			},
			html: {
				files: 'template/**',
				tasks: ['gitinfo', 'assemble']
			},
			livereload: {
				options: {
					atBegin: false,
					livereload: true
				},
				files: '<%= options.build %>'
			}
		}
	});

	require('load-grunt-tasks')(grunt);
	// waiting for assemble 0.5.0
	grunt.loadNpmTasks('assemble');

	grunt.registerTask('font', ['fontello', 'clean:tmp']);

	// clean:tmp in the end as workaround rimraf bug
	grunt.registerTask('default', ['gitinfo', 'clean', 'less:default',
	                               'fontello', 'uglify', 'assemble',
	                               'copy:libs', 'compress', 'clean:tmp']);
	grunt.registerTask('dev', ['gitinfo', 'clean', 'less:dev', 'fontello',
	                           'concat', 'assemble', 'copy:libs', 'clean:tmp']);
};
