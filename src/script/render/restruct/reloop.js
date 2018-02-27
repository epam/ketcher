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

import Vec2 from '../../util/vec2';
import Visel from './visel';
import ReObject from './reobject';
import scale from '../../util/scale';
import util from '../util';
import { Bond } from '../../chem/struct';

const tfx = util.tfx;

function ReLoop(loop) {
	this.loop = loop;
	this.visel = new Visel('loop');
	this.centre = new Vec2();
	this.radius = new Vec2();
}
ReLoop.prototype = new ReObject();
ReLoop.isSelectable = function () {
	return false;
};

ReLoop.prototype.show = function (restruct, rlid, options) { // eslint-disable-line max-statements
	var render = restruct.render;
	var paper = render.paper;
	var molecule = restruct.molecule;
	var loop = this.loop;
	this.centre = new Vec2();
	loop.hbs.forEach((hbid) => {
		var hb = molecule.halfBonds.get(hbid);
		var bond = restruct.bonds.get(hb.bid);
		var apos = scale.obj2scaled(restruct.atoms.get(hb.begin).a.pp, options);
		if (bond.b.type !== Bond.PATTERN.TYPE.AROMATIC)
			loop.aromatic = false;
		this.centre.add_(apos); // eslint-disable-line no-underscore-dangle
	});
	loop.convex = true;
	for (var k = 0; k < this.loop.hbs.length; ++k) {
		var hba = molecule.halfBonds.get(loop.hbs[k]);
		var hbb = molecule.halfBonds.get(loop.hbs[(k + 1) % loop.hbs.length]);
		var angle = Math.atan2(
			Vec2.cross(hba.dir, hbb.dir),
			Vec2.dot(hba.dir, hbb.dir)
		);
		if (angle > 0)
			loop.convex = false;
	}

	this.centre = this.centre.scaled(1.0 / loop.hbs.length);
	this.radius = -1;
	loop.hbs.forEach((hbid) => {
		var hb = molecule.halfBonds.get(hbid);
		var apos = scale.obj2scaled(restruct.atoms.get(hb.begin).a.pp, options);
		var bpos = scale.obj2scaled(restruct.atoms.get(hb.end).a.pp, options);
		var n = Vec2.diff(bpos, apos).rotateSC(1, 0).normalized();
		var dist = Vec2.dot(Vec2.diff(apos, this.centre), n);
		this.radius = (this.radius < 0) ? dist : Math.min(this.radius, dist);
	});
	this.radius *= 0.7;
	if (!loop.aromatic)
		return;
	var path = null;
	if (loop.convex && options.aromaticCircle) {
		path = paper.circle(this.centre.x, this.centre.y, this.radius)
			.attr({
				stroke: '#000',
				'stroke-width': options.lineattr['stroke-width']
			});
	} else {
		var pathStr = '';
		for (k = 0; k < loop.hbs.length; ++k) {
			hba = molecule.halfBonds.get(loop.hbs[k]);
			hbb = molecule.halfBonds.get(loop.hbs[(k + 1) % loop.hbs.length]);
			angle = Math.atan2(
				Vec2.cross(hba.dir, hbb.dir),
				Vec2.dot(hba.dir, hbb.dir)
			);
			var halfAngle = (Math.PI - angle) / 2;
			var dir = hbb.dir.rotate(halfAngle);
			var pi = scale.obj2scaled(restruct.atoms.get(hbb.begin).a.pp, options);
			var sin = Math.sin(halfAngle);
			var minSin = 0.1;
			if (Math.abs(sin) < minSin)
				sin = sin * minSin / Math.abs(sin);
			var offset = options.bondSpace / sin;
			var qi = pi.addScaled(dir, -offset);
			pathStr += (k === 0 ? 'M' : 'L');
			pathStr += tfx(qi.x) + ',' + tfx(qi.y);
		}
		pathStr += 'Z';
		path = paper.path(pathStr)
			.attr({
				stroke: '#000',
				'stroke-width': options.lineattr['stroke-width'],
				'stroke-dasharray': '- '
			});
	}
	restruct.addReObjectPath('data', this.visel, path, null, true);
};

ReLoop.prototype.isValid = function (struct, rlid) {
	const halfBonds = struct.halfBonds;
	return this.loop.hbs.every(hbid =>
		halfBonds.has(hbid) && halfBonds.get(hbid).loop === rlid);
};

export default ReLoop;
