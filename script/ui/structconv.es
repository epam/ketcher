var Struct = require('../chem/struct');

function fromBond(sbond) {
	var type = sbond.type;
	var stereo = sbond.stereo;
	return {
		type: bondType2Caption(type, stereo),
		topology: sbond.topology || 0,
		center: sbond.reactingCenterStatus || 0
	};
}

function toBond(bond) {
	return Object.assign(caption2BondType(bond.type), {
		topology: parseInt(bond.topology, 10),
		reactingCenterStatus: parseInt(bond.center, 10)
	});
}

function bondType2Caption(type, stereo) {
	for (var caption in bondCaptionMap) {
		if (bondCaptionMap[caption].type == type &&
		    bondCaptionMap[caption].stereo == stereo)
			return caption;
	}
	throw 'No such bond caption';
}

function caption2BondType(caption) {
	return Object.assign({}, bondCaptionMap[caption]);
}

var bondCaptionMap = {
	single: {
		type: Struct.Bond.PATTERN.TYPE.SINGLE,
		stereo: Struct.Bond.PATTERN.STEREO.NONE
	},
	up: {
		type: Struct.Bond.PATTERN.TYPE.SINGLE,
		stereo: Struct.Bond.PATTERN.STEREO.UP
	},
	down: {
		type: Struct.Bond.PATTERN.TYPE.SINGLE,
		stereo: Struct.Bond.PATTERN.STEREO.DOWN
	},
	updown: {
		type: Struct.Bond.PATTERN.TYPE.SINGLE,
		stereo: Struct.Bond.PATTERN.STEREO.EITHER
	},
	double: {
		type: Struct.Bond.PATTERN.TYPE.DOUBLE,
		stereo: Struct.Bond.PATTERN.STEREO.NONE
	},
	crossed: {
		type: Struct.Bond.PATTERN.TYPE.DOUBLE,
		stereo: Struct.Bond.PATTERN.STEREO.CIS_TRANS
	},
	triple: {
		type: Struct.Bond.PATTERN.TYPE.TRIPLE,
		stereo: Struct.Bond.PATTERN.STEREO.NONE
	},
	aromatic: {
		type: Struct.Bond.PATTERN.TYPE.AROMATIC,
		stereo: Struct.Bond.PATTERN.STEREO.NONE
	},
	singledouble: {
		type: Struct.Bond.PATTERN.TYPE.SINGLE_OR_DOUBLE,
		stereo: Struct.Bond.PATTERN.STEREO.NONE
	},
	singlearomatic: {
		type: Struct.Bond.PATTERN.TYPE.SINGLE_OR_AROMATIC,
		stereo: Struct.Bond.PATTERN.STEREO.NONE
	},
	doublearomatic: {
		type: Struct.Bond.PATTERN.TYPE.DOUBLE_OR_AROMATIC,
		stereo: Struct.Bond.PATTERN.STEREO.NONE
	},
	any: {
		type: Struct.Bond.PATTERN.TYPE.ANY,
		stereo: Struct.Bond.PATTERN.STEREO.NONE
	}
};

module.exports = {
	fromBond: fromBond,
	toBond: toBond,
	caption2BondType: caption2BondType
};
