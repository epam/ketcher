var Vec2 = require('../util/vec2');
var util = require('../util');

var element = require('./element');

var Bond = function (params)
{
	if (!params || !('begin' in params) || !('end' in params) || !('type' in params))
		throw new Error('\'begin\', \'end\' and \'type\' properties must be specified!');

	this.begin = params.begin;
	this.end = params.end;
	this.type = params.type;
	util.ifDef(this, params, 'stereo', Bond.PATTERN.STEREO.NONE);
	util.ifDef(this, params, 'topology', Bond.PATTERN.TOPOLOGY.EITHER);
	util.ifDef(this, params, 'reactingCenterStatus', 0);
	this.hb1 = null; // half-bonds
	this.hb2 = null;
	this.len = 0;
	this.center = new Vec2();
	this.sb = 0;
	this.sa = 0;
	this.angle = 0;
};

Bond.PATTERN =
{
	TYPE:
 {
		SINGLE: 1,
		DOUBLE: 2,
		TRIPLE: 3,
		AROMATIC: 4,
		SINGLE_OR_DOUBLE: 5,
		SINGLE_OR_AROMATIC: 6,
		DOUBLE_OR_AROMATIC: 7,
		ANY: 8
	},
	
	STEREO:
 {
		NONE: 0,
		UP: 1,
		EITHER: 4,
		DOWN: 6,
		CIS_TRANS: 3
	},
	
	TOPOLOGY:
 {
		EITHER: 0,
		RING: 1,
		CHAIN: 2
	},
	
	REACTING_CENTER:
 {
		NOT_CENTER: -1,
		UNMARKED: 0,
		CENTER: 1,
		UNCHANGED: 2,
		MADE_OR_BROKEN: 4,
		ORDER_CHANGED: 8,
		MADE_OR_BROKEN_AND_CHANGED: 12
	}
};

Bond.attrlist = {
	'type': Bond.PATTERN.TYPE.SINGLE,
	'stereo': Bond.PATTERN.STEREO.NONE,
	'topology': Bond.PATTERN.TOPOLOGY.EITHER,
	'reactingCenterStatus': 0
};

Bond.getAttrHash = function (bond) {
	var attrs = new Hash();
	for (var attr in Bond.attrlist) {
		if (typeof(bond[attr]) !== 'undefined') {
			attrs.set(attr, bond[attr]);
		}
	}
	return attrs;
};

Bond.attrGetDefault = function (attr) {
	if (attr in Bond.attrlist)
		return Bond.attrlist[attr];
	throw new Error('Attribute unknown');
}

Bond.prototype.hasRxnProps =  function ()
{
	return !!this.reactingCenterStatus;
};

Bond.prototype.getCenter = function (struct) {
	var p1 = struct.atoms.get(this.begin).pp;
	var p2 = struct.atoms.get(this.end).pp;
	return Vec2.lc2(p1, 0.5, p2, 0.5);
}

Bond.prototype.getDir = function (struct) {
	var p1 = struct.atoms.get(this.begin).pp;
	var p2 = struct.atoms.get(this.end).pp;
	return p2.sub(p1).normalized();
}

Bond.prototype.clone = function (aidMap)
{
	var cp = new Bond(this);
	if (aidMap) {
		cp.begin = aidMap[cp.begin];
		cp.end = aidMap[cp.end];
	}
	return cp;
};

Bond.prototype.findOtherEnd = function (i)
{
	if (i == this.begin)
		return this.end;
	if (i == this.end)
		return this.begin;
	throw new Error('bond end not found');
};

module.exports = Bond;