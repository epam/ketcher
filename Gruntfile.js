/* jshint node: true */

module.exports = function(grunt) {
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		options: {
			banner: grunt.file.read('script/banner.js'),
			semver: '<%= pkg.name %>-<%= pkg.version %>',

			libs: ['prototype-min.js', 'raphael.js'],
			src: ['script/**',
				  'Gruntfile.js', 'package.json',
				  '.jshintrc', '.editorconfig'],
			build: ['<%= concat.default.dest %>'],
			distrib: ['LICENSE.GPL', 'favicon.ico', 'ketcher.py',
					  'ketcher.html', 'demo.html', 'templates.sdf',
					  'ketcher.css', 'loading.gif', 'icons/**']
		},

		concat: {
			default: {  // and the only yet

				options: {
					banner: '<%= options.banner %>',
					stripBanners: true
				},
				src: ['script/vendor/base64.js',
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
					archive: '<%= options.semver %>.zip'
				},
				src: ['<%= options.build %>', '<%= options.libs %>',
					  '<%= options.distrib %>'],
				dest: '<%= pkg.name %>'
			},
			build_with_sources: {
				options: {
					archive: '<%= options.semver %>-src.zip'
				},
				src: ['<%= compress.build.src %>', '<%= options.src %>'],
				dest: '<%= pkg.name %>'
			}
		},

		clean: {
			all: ['<%= options.libs %>', '<%= options.build %>',
				  '<%= options.semver %>*.zip']
		},

		watch: {
			options: {
				atBegin: true
			},
			js: {
				files: 'script/**/*.js',
				tasks: 'concat'
			},
			livereload: {
				options: {
					livereload: true
				},
				files: '<%= options.build %>'
			}
		}
	});

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('default', ['clean', 'uglify', 'copy:libs',
								   'compress']);
	grunt.registerTask('dev', ['clean', 'concat', 'copy:libs']);
};
