import { ifDef } from '../../utils';

import Atom from '../../../chem/struct/atom';
import Bond from '../../../chem/struct/bond';
import SGroup from '../../../chem/struct/sgroup';
import Vec2 from '../../../util/vec2';


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
	ifDef(params, 'center', source.center);
	ifDef(params, 'stereo', source.stereo);
	if (params.stereo)
		params.stereo = params.stereo > 1 ? params.stereo * 2 : params.stereo;

	params.xxx = 0;

	ifDef(params, 'begin', source.atoms[0]);
	ifDef(params, 'end', source.atoms[1]);

	return new Bond(params);
}

export function sgroupToStruct(source) {
	const sgroup = new SGroup(source.type);

	const normAtoms = source.atoms.map(aid => aid - 1);
	const normPatoms = source.patoms ? source.patoms.map(aid => aid - 1) : null;

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

export function rgroupLogicToStruct(rgnumber, rglogic) {
	const params = {};

	ifDef(params, 'number', rgnumber);
	ifDef(params, 'range', rglogic.range);
	ifDef(params, 'resth', rglogic.resth);
	ifDef(params, 'ifthen', rglogic.ifthen);

	return params;
}

