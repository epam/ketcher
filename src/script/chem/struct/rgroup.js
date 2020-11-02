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

import Pile from '../../util/pile';

function RGroup(logic) {
	logic = logic || {};
	this.frags = new Pile();
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

/**
 * @param rgroups { Pool<number, RGroup> }
 * @param frid { number }
 */
RGroup.findRGroupByFragment = function (rgroups, frid) {
	return rgroups.find((rgid, rgroup) => rgroup.frags.has(frid));
};

/**
 * @param fidMap { Map<number, number> }
 * @returns { RGroup }
 */
RGroup.prototype.clone = function (fidMap) {
	const ret = new RGroup(this);
	this.frags.forEach((fid) => {
		ret.frags.add(fidMap ? fidMap.get(fid) : fid);
	});
	return ret;
};

export default RGroup;
