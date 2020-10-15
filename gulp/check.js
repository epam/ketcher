/****************************************************************************
 * Copyright 2020 EPAM Systems
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
const PluginError = require('plugin-error');

module.exports.checkDepsExact = function (options, cb) {
	const semver = require('semver'); // TODO: output corrupted packages
	const allValid = ['dependencies', 'devDependencies'].every((d) => {
		const dep = options.pkg[d];
		return Object.keys(dep).every((name) => {
			const ver = dep[name];
			return (semver.valid(ver) && semver.clean(ver));
		});
	});
	if (!allValid) {
		cb(new PluginError('check-deps-exact',
			'All top level dependencies should be installed' +
			'using `npm install --save-exact` command'));
	} else {
		cb();
	}
};