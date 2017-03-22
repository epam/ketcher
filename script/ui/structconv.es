import Struct from '../chem/struct';
import element from '../chem/element';

export function fromElement(selem) {
	if (selem.label == 'R#')
		return {
			type: 'rlabel',
			values: fromRlabel(selem.rglabel)
		};
	if (selem.label == 'L#')
		return fromAtomList(selem);
	if (element.map[selem.label])
		return fromAtom(selem);
	if (!selem.label && 'attpnt' in selem)
		return { ap: fromApoint(selem.attpnt) };

	return selem;   // probably generic
}

export function toElement(elem) {
	if (elem.type == 'rlabel')
		return {
			label: elem.values.length ? 'R#' : 'C',
			rglabel: toRlabel(elem.values)
		};
	if (elem.type == 'list' || elem.type == 'not-list')
		return toAtomList(elem);
	if (!elem.label && 'ap' in elem)
		return { attpnt: toApoint(elem.ap) };
	if (element.map[capitalize(elem.label)])
		return toAtom(elem);
	return elem;
}

function fromAtom(satom) {
	var charge = satom.charge - 0;
	var isotope = satom.isotope - 0;
	var explicitValence = satom.explicitValence - 0;
	var alias = satom.alias || '';
	return {
		alias: alias,
		pseudo: satom.pseudo,
		label: satom.label,
		charge: charge,
		isotope: isotope,
		explicitValence: explicitValence,
		radical: satom.radical,
		invRet: satom.invRet,
		exactChangeFlag: !!satom.exactChangeFlag,
		ringBondCount: satom.ringBondCount,
		substitutionCount: satom.substitutionCount,
		unsaturatedAtom: !!satom.unsaturatedAtom,
		hCount: satom.hCount
	};
}

function toAtom(atom) {
	// TODO merge this to Struct.Atom.attrlist?
	//      see ratomtool
	return {
		alias: atom.alias,
		pseudo: atom.pseudo,
		label: capitalize(atom.label),
		charge: !atom.charge ? 0 : parseInt(atom.charge, 10),
		isotope: !atom.isotope ? 0 : parseInt(atom.isotope, 10),
		explicitValence: !atom.explicitValence ? -1 : parseInt(atom.explicitValence, 10),
		radical: parseInt(atom.radical, 10) || 0,
		// reaction flags
		invRet: parseInt(atom.invRet, 10) || 0,
		exactChangeFlag: atom.exactChangeFlag || 0,
		// query flags
		ringBondCount: parseInt(atom.ringBondCount, 10) || 0,
		substitutionCount: parseInt(atom.substitutionCount, 10) || 0,
		unsaturatedAtom: atom.unsaturatedAtom || 0,
		hCount: parseInt(atom.hCount, 10) || 0
	};
}

function fromAtomList(satom) {
	return {
		type: satom.atomList.notList ? 'not-list' : 'list',
		values: satom.atomList.ids.map(i => element[i].label)
	};
}

function toAtomList(atom) {
	return {
		label: 'L#',
		atomList: new Struct.AtomList({
			notList: atom.type == 'not-list',
			ids: atom.values.map(el => element.map[el])
		})
	};
}

function fromApoint(sap) {
	return {
		primary: ((sap || 0) & 1) > 0,
		secondary: ((sap || 0) & 2) > 0
	};
}

function toApoint(ap) {
	return (ap.primary && 1) + (ap.secondary && 2);
}

function fromRlabel(rg) {
	var res = [];
	for (var rgi = 0; rgi < 32; rgi++) {
		if (rg & (1 << rgi)) {
			var val = rgi + 1;
			res.push(val); // push the string
		}
	}
	return res;
}

function toRlabel(values) {
	var res = 0;
	values.forEach(function (val) {
		var rgi = val - 1;
		res |= 1 << rgi;
	});
	return res;
}

export function fromBond(sbond) {
	const type = sbond.type;
	const stereo = sbond.stereo;
	return {
		type: fromBondType(type, stereo),
		topology: sbond.topology || 0,
		center: sbond.reactingCenterStatus || 0
	};
}

export function toBond(bond) {
	return {
		topology: parseInt(bond.topology, 10),
		reactingCenterStatus: parseInt(bond.center, 10),
		...toBondType(bond.type)
	};
}

export function toBondType(caption) {
	return Object.assign({}, bondCaptionMap[caption]);
}

function fromBondType(type, stereo) {
	for (var caption in bondCaptionMap) {
		if (bondCaptionMap[caption].type == type &&
		    bondCaptionMap[caption].stereo == stereo)
			return caption;
	}
	throw 'No such bond caption';
}

function capitalize(str) {
	return str[0].toUpperCase() + str.slice(1).toLowerCase();
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
