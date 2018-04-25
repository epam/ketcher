import { ifDef } from '../../utils';
import Struct, { Atom, Bond, SGroup } from '../../../chem/struct';
import Vec2 from '../../../util/vec2';


export function moleculeToStruct(graphItem) {
	const struct = new Struct();
	graphItem.atoms.forEach(atom => struct.atoms.add(atomToStruct(atom)));

	if (graphItem.bonds)
		graphItem.bonds.forEach(bond => struct.bonds.add(bondToStruct(bond)));

	if (graphItem.sgroups) {
		graphItem.sgroups.forEach(sgroup => struct.sgroups.add(sgroupToStruct(sgroup)));

		if (graphItem.sgroups.forEach(sgroup => sgroup.type === 'MUL')) {
			graphItem.atoms = collapseMulAtoms(graphItem.atoms);
			graphItem.bonds = collapseMulBonds(graphItem.bonds, graphItem.atoms.map((a, i) => i));
		}
	}
	struct.initHalfBonds();
	struct.initNeighbors();
	struct.markFragments();
	return struct;
}

function collapseMulAtoms(atoms) {
	return atoms
		.reduce((acc, atom) => {
			const atomInSameLocation = acc.find(elem =>
				elem.location.x === atom.location.x &&
				elem.location.y === atom.location.y &&
				elem.location.z === atom.location.z);

			if (!atomInSameLocation)
				acc.push(atom);

			return acc;
		}, []);
}

function collapseMulBonds(bonds, atoms) {
	return bonds
		.filter(bond => atoms.includes(atoms[0]) && atoms.includes(bond.atoms[1]));
}

export function atomToStruct(source) {
	const params = {};

	ifDef(params, 'label', source.label);
	ifDef(params, 'alias', source.alias);
	ifDef(params, 'pp', {
		x: source.location[0],
		y: source.location[1],
		z: source.location[2] || 0.0
	});
	ifDef(params, 'charge', source.charge);
	ifDef(params, 'explicitValence', source.explicitValence);
	ifDef(params, 'isotope', source.isotope);
	ifDef(params, 'radical', source.radical);
	ifDef(params, 'attachmentPoints', source.attpnt);
	// stereo
	ifDef(params, 'stereoParity', source.stereoParity);
	ifDef(params, 'weight', source.weight);
	// query
	ifDef(params, 'ringBondCount', source.ringBondCount);
	ifDef(params, 'substitutionCount', source.substitutionCount);
	ifDef(params, 'unsaturatedAtom', !!source.unsaturatedAtom);
	ifDef(params, 'hCount', source.hCount);
	// reaction
	ifDef(params, 'aam', source.mapping);
	ifDef(params, 'invRet', source.invRet);
	ifDef(params, 'exactChangeFlag', !!source.exactChangeFlag);
	ifDef(params, 'rglabel', source.rgroups ? source.rgroups[0] : null);
	ifDef(params, 'fragment', source.fragment, -1);
	return new Atom(params);
}

export function bondToStruct(source) {
	const params = {};

	ifDef(params, 'type', source.type);
	ifDef(params, 'topology', source.topology);
	ifDef(params, 'reactingCenterStatus', source.center);
	ifDef(params, 'stereo', source.stereo);
	// if (params.stereo)
	// 	params.stereo = params.stereo > 1 ? params.stereo * 2 : params.stereo;
	// params.xxx = 0;
	ifDef(params, 'begin', source.atoms[0]);
	ifDef(params, 'end', source.atoms[1]);

	return new Bond(params);
}

export function sgroupToStruct(source) {
	const sgroup = new SGroup(source.type);

	const normAtoms = source.atoms.map(aid => aid);
	const normPatoms = source.patoms ? source.patoms.map(aid => aid) : null;

	const fieldDisp = parseFieldDisp(source.fieldDisp);

	sgroup.atoms = source.type === 'MUL' ? normPatoms : normAtoms;
	sgroup.bonds = source.bonds;
	sgroup.patoms = normPatoms;
	sgroup.xbonds = source.xbonds;
	sgroup.pp = fieldDisp.pp;
	sgroup.data = {
		mul: source.mul || 1,
		subscript: source.subscript || 'n',
		connectivity: source.connectivity || 'ht',
		name: source.type === 'SUP' ? (source.subscript || '') : '',
		fieldName: source.fieldName || '',
		fieldValue: source.fieldData || '',
		fieldType: source.fieldData === '-1' ? '' : 'F',
		query: source.query || '',
		queryOp: source.queryOp || '',
		daspPos: fieldDisp.daspPos
	};

	return sgroup;
}

function parseFieldDisp(fieldDisp) {
	if (!fieldDisp || fieldDisp === '')
		return new Vec2();

	const tokens = fieldDisp.split(/\s+/).filter(str => str !== '');

	return {
		pp: new Vec2(
			parseFloat(tokens[0]),
			-parseFloat(tokens[1])
		),
		daspPos: parseInt(tokens[5])
	};
}

