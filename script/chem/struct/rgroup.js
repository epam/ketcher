/****************************************************************************
 * Copyright 2017 EPAM Systems
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

var Pool = require('../../util/pool');

function RGroup(logic) {
	logic = logic || {};
	this.frags = new Pool();
	this.resth = logic.resth || false;
	this.range = logic.range || '';
	this.ifthen = logic.ifthen || 0;
}

RGroup.prototype.getAttrs = function () {
	return {
		resth: this.resth,
		range: this.range,
		ifthen: this.ifthen
	};
};

RGroup.findRGroupByFragment = function (rgroups, frid) {
	var ret;
	rgroups.each((rgid, rgroup) => {
		if (rgroup.frags.keyOf(frid)) ret = rgid;
	});
	return ret;
};

RGroup.prototype.clone = function (fidMap) {
	var ret = new RGroup(this);
	this.frags.each((fnum, fid) => {
		ret.frags.add(fidMap ? fidMap[fid] : fid);
	});
	return ret;
};

module.exports = RGroup;
