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
const cp = require('child_process');

module.exports.version = function (options, cb) {
	const pkg = options.pkg;
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
};

module.exports.createBundleConfig = (options) => ({
	entries: 'src/script',
	extensions: ['.js', '.jsx'],
	debug: true,
	standalone: options.pkg.name,
	transform: [
		['exposify', {
			expose: { 'raphael': 'Raphael' }
		}],
		['browserify-replace', {
			replace: [
				{ from: '__VERSION__', to: options.pkg.version },
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
