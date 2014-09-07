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

			pkg: '<%= pkg %>',
			git: {
				tag: '<%= gitinfo.local.branch.current.tag %>',
				rev: '<%= gitinfo.local.branch.current.lastCommitNumber %>'
			},

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

		concat: {
			default: {  // and the only yet

				options: {
					banner: '<%= options.banner %>',
					stripBanners: true
				},
				src: [//'script/vendor/es5-shim.js',
				      'script/vendor/html5shiv.js',
				      'script/vendor/base64.js',

				      'script/util/*.js',

				      'script/chem/element.js',
				      'script/chem/struct.js',
				      'script/chem/*.js',

				      'script/rnd/visel.js',
				      'script/rnd/restruct.js',
				      'script/rnd/*.js',

				      'script/ui/**/*.js',

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
					           'template/dialog/*'],
					options: '<%= options %>',
					postprocess: require('pretty')
				},

				src: 'template/main.hbs',
				dest: '<%= pkg.name %>.html'
			}
		},

		fontello: {
			options: {
				config  : 'icons/config.json',
				fonts   : '.',
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
				dest: '.'
			},
			'svg-fix': {
				expand: true,
				cwd: '.tmp',
				src: ['<%= pkg.name %>.{svg,ttf}'],
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
				basename: '<%= pkg.name %>-' +
					      '<%= gitinfo.local && options.git.tag || ' +
					          'gitinfo.local && "rev:" + options.git.rev || ' +
					          'pkg.version %>',
				level: 9
			},
			build: {
				options: {
					archive: '<%= compress.options.basename %>.zip'
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
					archive: '<%= compress.options.basename %>-src.zip'
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
	                               'copy', 'compress', 'clean:tmp']);
	grunt.registerTask('dev', ['gitinfo', 'clean', 'less:dev', 'fontello',
	                           'concat', 'assemble', 'copy', 'clean:tmp']);
};
