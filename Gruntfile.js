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
			dist: 'dist'
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

	require('load-grunt-tasks')(grunt);
};
