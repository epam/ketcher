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

// Visel is a shorthand for VISual ELement
// It corresponds to a visualization (i.e. set of paths) of an atom or a bond.
import Box2Abs from '../../util/box2abs';
import Vec2 from '../../util/vec2';

function Visel(type) {
	this.type = type;
	this.paths = [];
	this.boxes = [];
	this.boundingBox = null;
}

Visel.prototype.add = function (path, bb, ext) {
	this.paths.push(path);
	if (bb) {
		this.boxes.push(bb);
		this.boundingBox = this.boundingBox == null ? bb : Box2Abs.union(this.boundingBox, bb);
	}
	if (ext)
		this.exts.push(ext);
};

Visel.prototype.clear = function () {
	this.paths = [];
	this.boxes = [];
	this.exts = [];
	this.boundingBox = null;
};

Visel.prototype.translate = function (x, y) {
	if (arguments.length > 2) // TODO: replace to debug time assert
		throw new Error('One vector or two scalar arguments expected');
	if (y === undefined) {
		this.translate(x.x, x.y);
	} else {
		var delta = new Vec2(x, y);
		for (var i = 0; i < this.paths.length; ++i)
			this.paths[i].translateAbs(x, y);
		for (var j = 0; j < this.boxes.length; ++j)
			this.boxes[j] = this.boxes[j].translate(delta);
		if (this.boundingBox !== null)
			this.boundingBox = this.boundingBox.translate(delta);
	}
};

export default Visel;
