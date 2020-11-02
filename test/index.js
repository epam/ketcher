#!/usr/bin/env nodejs
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

/* eslint-env node */

var path = require('path');
var cp = require('child_process');

var minimist = require('minimist');

var opts = process.argv.slice(3);
var script = require.resolve(path.join(__dirname, process.argv[2]));
var binPath = cp.execSync('npm bin').toString().trim();
var tapScript = path.join(binPath, 'tap');

var filterSpec = {
	string: ['reporter'],
	default: { reporter: 'classic' },
	alias: { reporter: 'R' },
	unknown: o => filterSpec.string.includes(o)
};
var filterOpts = minimist(process.argv.slice(3), filterSpec);

cp.spawn(`node ${script} ${opts.join(' ')} |` +
         `${tapScript} --reporter=${filterOpts.reporter} -`,
         { shell: true, stdio: 'inherit' });
