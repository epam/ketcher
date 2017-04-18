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
	if (elem.label == 'A' || elem.label == '*' || elem.label == 'Q' ||
		elem.label == 'X' || elem.label == 'R') {
		elem.pseudo = elem.label;
		return toAtom(elem);
	}

	return elem;
}

function fromAtom(satom) {
	var alias = satom.alias || '';
	return {
		alias: alias,
		label: satom.label,
		charge: satom.charge,
		isotope: satom.isotope,
		explicitValence: satom.explicitValence,
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
	return Object.assign({}, atom, {
		label: capitalize(atom.label)
	});
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
		topology: bond.topology,
		reactingCenterStatus: bond.center,
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

import { mapOf } from './component/form';
import { sgroupSpecial as sgroupSpecialSchema } from './structschema.es';

const schemes = Object.keys(sgroupSpecialSchema).reduce((acc, title) => {
	acc[title] = mapOf(sgroupSpecialSchema[title], 'fieldName');
	return acc;
}, {});

const defineContext = (fieldName, fieldValue) =>
	Object.keys(schemes)
		.find(context => {
			if (schemes[context][fieldName]) {
				return schemes[context][fieldName].properties.fieldValue.enum ?
					schemes[context][fieldName].properties.fieldValue.enum.filter(value => value === fieldValue).length > 0 :
					true;
			}

			return false;
		});


const firstObjKey = obj => Object.keys(obj)[0];
const defaultContext = () => firstObjKey(schemes);
const defaultFieldName = context => firstObjKey(schemes[context]);
const defaultFieldValue = (context, fieldName) => schemes[context][fieldName].properties.fieldValue.default;

export function fromSgroup(ssgroup) {
	const type = ssgroup.type || 'GEN';
	const { fieldName, fieldValue, absolute, attached } = ssgroup.attrs;

	if (type === 'DAT') {
		if (fieldName && fieldValue) {
			ssgroup.attrs.context = defineContext(fieldName, fieldValue);
		} else {
			ssgroup.attrs.context = defaultContext();
			ssgroup.attrs.fieldName = defaultFieldName(ssgroup.attrs.context);
			ssgroup.attrs.fieldValue = defaultFieldValue(ssgroup.attrs.context, ssgroup.attrs.fieldName);
		}
	}

	if (absolute === false && attached === false)
		ssgroup.attrs.radiobuttons = 'Relative';
	else ssgroup.attrs.radiobuttons = attached ? 'Attached' : 'Absolute';

	return Object.assign({ type: type }, ssgroup.attrs);
}

export function toSgroup(sgroup) {
	let { type, radiobuttons, ...props } = sgroup;
	let attrs = { ...props };

	const absolute = 'absolute';
	const attached = 'attached';

	switch (radiobuttons) {
	case 'Absolute':
		attrs[absolute] = true;
		attrs[attached] = false;
		break;
	case 'Attached':
		attrs[absolute] = false;
		attrs[attached] = true;
		break;
	case 'Relative':
		attrs[absolute] = false;
		attrs[attached] = false;
		break;
	}

	return {
		type,
		attrs
	}
}
