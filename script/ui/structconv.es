import Struct from '../chem/struct';

export function fromBond(sbond) {
	const type = sbond.type;
	const stereo = sbond.stereo;
	return {
		type: bondType2Caption(type, stereo),
		topology: sbond.topology || 0,
		center: sbond.reactingCenterStatus || 0
	};
}

export function toBond(bond) {
	return {
		topology: parseInt(bond.topology, 10),
		reactingCenterStatus: parseInt(bond.center, 10),
		...caption2BondType(bond.type)
	};
}

export function fromApoint(sap) {
	return {
		primary: ((sap || 0) & 1) > 0,
		secondary: ((sap || 0) & 2) > 0
	};
}

export function toApoint(ap) {
	return (ap.primary && 1) + (ap.secondary && 2);
}

export function caption2BondType(caption) {
	return Object.assign({}, bondCaptionMap[caption]);
}

function bondType2Caption(type, stereo) {
	for (var caption in bondCaptionMap) {
		if (bondCaptionMap[caption].type == type &&
		    bondCaptionMap[caption].stereo == stereo)
			return caption;
	}
	throw 'No such bond caption';
}

const bondCaptionMap = {
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
