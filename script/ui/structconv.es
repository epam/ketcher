import Struct from '../chem/struct';
import element from '../chem/element';

export function fromAtom(satom) {
	var charge = satom.charge - 0;
	var isotope = satom.isotope - 0;
	var explicitValence = satom.explicitValence - 0;
	return {
		label: satom.label,
		charge: charge == 0 ? '' : charge,
		isotope: isotope == 0 ? '' : isotope,
		explicitValence: explicitValence < 0 ? '' : explicitValence,
		radical: satom.radical,
		invRet: satom.invRet,
		exactChangeFlag: satom.exactChangeFlag,
		ringBondCount: satom.ringBondCount,
		substitutionCount: satom.substitutionCount,
		unsaturatedAtom: satom.unsaturatedAtom,
		hCount: satom.hCount
	};
}

export function toAtom(atom) {
	return {
		label: atom.label,
		charge: atom.charge == '' ? 0 : parseInt(atom.charge, 10),
		isotope: atom.isotope == '' ? 0 : parseInt(atom.isotope, 10),
		explicitValence: atom.explicitValence == '' ? -1 : parseInt(atom.explicitValence, 10),
		radical: parseInt(atom.radical, 10),
		// reaction flags
		invRet: parseInt(atom.invRet, 10),
		exactChangeFlag: atom.exactChangeFlag,
		// query flags
		ringBondCount: parseInt(atom.ringBondCount, 10),
		substitutionCount: parseInt(atom.substitutionCount, 10),
		unsaturatedAtom: atom.unsaturatedAtom,
		hCount: parseInt(atom.hCount, 10)
	};
}

export function fromAtomList(satom) {
	return {
		type: satom.atomList.notList ? 'not-list' : 'list',
		values: satom.atomList.ids.map(id => id + '')
	};
}

export function toAtomList(atom) {
	return {
		label: 'L#',
		atomList: new Struct.AtomList({
			notList: atom.type == 'not-list',
			ids: atom.values.map(val => parseInt(val, 10))
		})
	};
}

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

export function fromRlabel(rg) {
	var res = [];
	for (var rgi = 0; rgi < 32; rgi++) {
		if (rg & (1 << rgi)) {
			var val = 'R' + (rgi + 1);
			res.push(val); // push the string
		}
	}
	return res;
}

export function toRlabel(vals) {
	var res = 0;
	vals.values.forEach(function (val) {
		var rgi = val.substr(1) - 1;
		res |= 1 << rgi;
	});
	return res;
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
