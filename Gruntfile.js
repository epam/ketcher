/* jshint node: true */

module.exports = function(grunt) {
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		options: {
			banner: grunt.file.read('script/banner.js'),
			src: ['script/**', 'style/**', 'icons/**',
				  'Gruntfile.js', 'package.json',
				  '.jshintrc', '.editorconfig'],
			libs: ['prototype-min.js', 'raphael.js'],
			build: ['<%= concat.default.dest %>',
				    '<%= less.default.dest %>',
				    '<%= pkg.name %>.{svg,ttf,eot,woff}'],
			distrib: ['LICENSE.GPL', 'favicon.ico', 'ketcher.py',
					  'ketcher.html', 'demo.html', 'templates.sdf',
					  'loading.gif']
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
					  'script/reaxys/*.js',

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
					cleancss: true
				},
				src: 'style/main.less',
				dest: '<%= pkg.name %>.css'
			},
			dev: {
				files: ['<%= less.default %>']
			}
		},

		// TODO: path grunt-fontforge
		svgicons2svgfont: {
			options: {
				font: '<%= pkg.name %>'
			},
			default: {
				src: 'icons/*.svg',
				dest: '.'
			}
		},
		svg2ttf: {
			default: {
				src: '<%= pkg.name %>.svg',
				dest: '.'
			}
		},
		ttf2eot: {
			default: {
				src: '<%= pkg.name %>.ttf',
				dest: '.'
			}
		},
		ttf2woff: {
			default: {
				src: '<%= pkg.name %>.ttf',
				dest: '.'
			}
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
				src: ['<%= options.build %>', '<%= options.libs %>',
					  '<%= options.distrib %>'],
				dest: '<%= pkg.name %>'
			},
			build_with_sources: {
				options: {
					archive: '<%= pkg.name %>-<%= pkg.version %>-src.zip'
				},
				src: ['<%= compress.build.src %>', '<%= options.src %>'],
				dest: '<%= pkg.name %>'
			}
		},

		clean: {
			all: ['<%= options.libs %>', '<%= options.build %>',
				  '<%= pkg.name %>*.zip']
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
			livereload: {
				options: {
					atBegin: false,
					livereload: true
				},
				files: ['<%= options.build %>']
			}
		}
	});

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('font', ['svgicons2svgfont',
								'svg2ttf', 'ttf2eot', 'ttf2woff']);
	grunt.registerTask('default', ['clean', 'uglify', 'less:default',
								   'font', 'copy:libs', 'compress']);
	grunt.registerTask('dev', ['clean', 'concat', 'less:dev',
							   'font', 'copy:libs']);
};
