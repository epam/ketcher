var Vec2 = require('../util/vec2');

var SELECTION_DISTANCE_COEFFICIENT = 0.4;
var ui = global.ui;

function findClosestAtom(restruct, pos, minDist, skip) {
	var closestAtom = null;
	var maxMinDist = SELECTION_DISTANCE_COEFFICIENT;
	minDist = minDist || maxMinDist;
	minDist = Math.min(minDist, maxMinDist);
	restruct.atoms.each(function (aid, atom) {
		if (aid != skip) {
			var dist = Vec2.dist(pos, atom.a.pp);
			if (dist < minDist) {
				closestAtom = aid;
				minDist = dist;
			}
		}
	});
	if (closestAtom != null) {
		return {
			id: closestAtom,
			dist: minDist
		};
	}
	return null;
}

function findClosestBond(restruct, pos, minDist) {
	var closestBond = null;
	var closestBondCenter = null;
	var maxMinDist = SELECTION_DISTANCE_COEFFICIENT;
	minDist = minDist || maxMinDist;
	minDist = Math.min(minDist, maxMinDist);
	var minCDist = minDist;
	restruct.bonds.each(function (bid, bond) {
		var p1 = restruct.atoms.get(bond.b.begin).a.pp,
			p2 = restruct.atoms.get(bond.b.end).a.pp;
		var mid = Vec2.lc2(p1, 0.5, p2, 0.5);
		var cdist = Vec2.dist(pos, mid);
		if (cdist < minCDist) {
			minCDist = cdist;
			closestBondCenter = bid;
		}
	});
	restruct.bonds.each(function (bid, bond) {
		var hb = restruct.molecule.halfBonds.get(bond.b.hb1);
		var d = hb.dir;
		var n = hb.norm;
		var p1 = restruct.atoms.get(bond.b.begin).a.pp,
			p2 = restruct.atoms.get(bond.b.end).a.pp;

		var inStripe = Vec2.dot(pos.sub(p1), d) * Vec2.dot(pos.sub(p2), d) < 0;
		if (inStripe) {
			var dist = Math.abs(Vec2.dot(pos.sub(p1), n));
			if (dist < minDist) {
				closestBond = bid;
				minDist = dist;
			}
		}
	});
	if (closestBond !== null || closestBondCenter !== null) {
		return {
			id: closestBond,
			dist: minDist,
			cid: closestBondCenter,
			cdist: minCDist
		};
	}
	return null;
}

function findClosestChiralFlag(restruct, p) {
	var minDist;
	var ret;

	// there is only one chiral flag, but we treat it as a "map" for convenience
	restruct.chiralFlags.each(function (id, item) {
		var pos = item.pp;
		if (Math.abs(p.x - pos.x) < 1.0) {
			var dist = Math.abs(p.y - pos.y);
			if (dist < 0.3 && (!ret || dist < minDist)) {
				minDist = dist;
				ret = { id: id, dist: minDist };
			}
		}
	});
	return ret;
}

function findClosestDataSGroupData(restruct, p) {
	var minDist = null;
	var ret = null;

	restruct.sgroupData.each(function (id, item) {
		if (item.sgroup.type != 'DAT')
			throw new Error('Data group expected');
		if (item.sgroup.data.fieldName != "MRV_IMPLICIT_H") {
			var box = item.sgroup.dataArea;
			var inBox = box.p0.y < p.y && box.p1.y > p.y && box.p0.x < p.x && box.p1.x > p.x;
			var xDist = Math.min(Math.abs(box.p0.x - p.x), Math.abs(box.p1.x - p.x));
			if (inBox && (ret == null || xDist < minDist)) {
				ret = { id: id, dist: xDist };
				minDist = xDist;
			}
		}
	});
	return ret;
}

function findClosestFrag(restruct, p, skip, minDist) {
	minDist = Math.min(minDist || SELECTION_DISTANCE_COEFFICIENT,
	                   SELECTION_DISTANCE_COEFFICIENT);
	var ret;
	restruct.frags.each(function (fid, frag) {
		if (fid != skip) {
			var bb = frag.calcBBox(restruct, fid); // TODO any faster way to obtain bb?
			if (bb.p0.y < p.y && bb.p1.y > p.y && bb.p0.x < p.x && bb.p1.x > p.x) {
				var xDist = Math.min(Math.abs(bb.p0.x - p.x), Math.abs(bb.p1.x - p.x));
				if (!ret || xDist < minDist) {
					minDist = xDist;
					ret = { id: fid, dist: minDist };
				}
			}
		}
	});
	return ret;
}

function findClosestRGroup(restruct, p, skip, minDist) {
	minDist = Math.min(minDist || SELECTION_DISTANCE_COEFFICIENT,
	                   SELECTION_DISTANCE_COEFFICIENT);
	var ret;
	restruct.rgroups.each(function (rgid, rgroup) {
		if (rgid != skip) {
			if (rgroup.labelBox) { // should be true at this stage, as the label is visible
				if (rgroup.labelBox.contains(p, 0.5)) { // inside the box or within 0.5 units from the edge
					var dist = Vec2.dist(rgroup.labelBox.centre(), p);
					if (!ret || dist < minDist) {
						minDist = dist;
						ret = { id: rgid, dist: minDist };
					}
				}
			}
		}
	});
	return ret;
}

function findClosestRxnArrow(restruct, p) {
	var minDist;
	var ret;

	restruct.rxnArrows.each(function (id, arrow) {
		var pos = arrow.item.pp;
		if (Math.abs(p.x - pos.x) < 1.0) {
			var dist = Math.abs(p.y - pos.y);
			if (dist < 0.3 && (!ret || dist < minDist)) {
				minDist = dist;
				ret = { id: id, dist: minDist };
			}
		}
	});
	return ret;
}

function findClosestRxnPlus(restruct, p) {
	var minDist;
	var ret;

	restruct.rxnPluses.each(function (id, plus) {
		var pos = plus.item.pp;
		var dist = Math.max(Math.abs(p.x - pos.x), Math.abs(p.y - pos.y));
		if (dist < 0.5 && (!ret || dist < minDist)) {
			minDist = dist;
			ret = { id: id, dist: minDist };
		}
	});
	return ret;
}

function findClosestSGroup(restruct, p) {
	var ret = null;
	var minDist = SELECTION_DISTANCE_COEFFICIENT;
	restruct.molecule.sgroups.each(function (sgid, sg) {
		var d = sg.bracketDir,
			n = d.rotateSC(1, 0);
		var pg = new Vec2(Vec2.dot(p, d), Vec2.dot(p, n));
		for (var i = 0; i < sg.areas.length; ++i) {
			var box = sg.areas[i];
			var inBox = box.p0.y < pg.y && box.p1.y > pg.y && box.p0.x < pg.x && box.p1.x > pg.x;
			var xDist = Math.min(Math.abs(box.p0.x - pg.x), Math.abs(box.p1.x - pg.x));
			if (inBox && (ret == null || xDist < minDist)) {
				ret = sgid;
				minDist = xDist;
			}
		}
	});
	if (ret != null) {
		return {
			id: ret,
			dist: minDist
		};
	}
	return null;
}

function updret(res, type, item, force) {
	if (item != null && (res == null || res.dist > item.dist || force)) {
		return {
			type: type,
			id: item.id,
			dist: item.dist
		};
	}
	return res;
}

function findClosestItem(restruct, pos, maps, skip) { // eslint-disable-line max-statements
	var res = null;

	// TODO make it "map-independent", each object should be able to "report" its distance to point (something like ReAtom.dist(point))
	if (!maps || maps.indexOf('atoms') >= 0) {
		var atom = findClosestAtom(restruct,
			pos, undefined, !Object.isUndefined(skip) && skip.map == 'atoms' ? skip.id : undefined
		);
		res = updret(res, 'Atom', atom);
	}
	if (!maps || maps.indexOf('bonds') >= 0) {
		var bond = findClosestBond(restruct, pos);
		if (bond) {
			if (bond.cid !== null)
				res = updret(res, 'Bond', { id: bond.cid, dist: bond.cdist });
			if (res == null || res.dist > 0.4 * ui.render.options.scale) // hack
				res = updret(res, 'Bond', bond);
		}
	}
	if (!maps || maps.indexOf('chiralFlags') >= 0) {
		var flag = findClosestChiralFlag(restruct, pos);
		res = updret(res, 'ChiralFlag', flag); // [MK] TODO: replace this with map name, 'ChiralFlag' -> 'chiralFlags', to avoid the extra mapping "if (ci.type == 'ChiralFlag') ci.map = 'chiralFlags';"
	}
	if (!maps || maps.indexOf('sgroupData') >= 0) {
		var sgd = findClosestDataSGroupData(restruct, pos);
		res = updret(res, 'DataSGroupData', sgd);
	}
	if (!maps || maps.indexOf('sgroups') >= 0) {
		var sg = findClosestSGroup(restruct, pos);
		res = updret(res, 'SGroup', sg);
	}
	if (!maps || maps.indexOf('rxnArrows') >= 0) {
		var arrow = findClosestRxnArrow(restruct, pos);
		res = updret(res, 'RxnArrow', arrow);
	}
	if (!maps || maps.indexOf('rxnPluses') >= 0) {
		var plus = findClosestRxnPlus(restruct, pos);
		res = updret(res, 'RxnPlus', plus);
	}
	if (!maps || maps.indexOf('frags') >= 0) {
		var frag = findClosestFrag(restruct, pos, skip && skip.map == 'atoms' ? skip.id : undefined);
		res = updret(res, 'Fragment', frag);
	}
	if (!maps || maps.indexOf('rgroups') >= 0) {
		var rgroup = findClosestRGroup(restruct, pos);
		res = updret(res, 'RGroup', rgroup);
	}

	return res || {
		type: 'Canvas',
		id: -1
	};
}

module.exports = {
	atom: findClosestAtom,
	bond: findClosestBond,
	frag: findClosestFrag,
	rGroup: findClosestRGroup,
	sGroup: findClosestSGroup,
	dataSGgroupData: findClosestDataSGroupData,
	rxnArrow: findClosestRxnArrow,
	rxnPlus: findClosestRxnPlus,
	chiralFlag: findClosestChiralFlag,
	item: findClosestItem
};
