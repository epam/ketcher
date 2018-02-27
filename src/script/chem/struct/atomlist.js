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

import element from '../element';

function AtomList(params) {
	console.assert(params && 'notList' in params && 'ids' in params, '\'notList\' and \'ids\' must be specified!');

	this.notList = params.notList; /* boolean*/
	this.ids = params.ids; /* Array of integers*/
}

AtomList.prototype.labelList = function () {
	var labels = [];
	for (var i = 0; i < this.ids.length; ++i)
		labels.push(element[this.ids[i]].label);
	return labels;
};

AtomList.prototype.label = function () {
	var label = '[' + this.labelList().join(',') + ']';
	if (this.notList)
		label = '!' + label;
	return label;
};

AtomList.prototype.equals = function (x) {
	return this.notList == x.notList && (this.ids || []).sort().toString() === (x.ids || []).sort().toString();
};

export default AtomList;
