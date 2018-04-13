import structSchema from './structSchema';
import { /*schemify,*/ ifDef } from './utils';

import { fromRlabel } from './convertStruct';

export function atomToGraph(source) {
	const schema = structSchema.atom.properties;
	const result = {};

	ifDef(result, 'label', source.label);
	ifDef(result, 'alias', source.alias);
	ifDef(result, 'location', [source.pp.x, source.pp.y, source.pp.z]);
	ifDef(result, 'rgroups', fromRlabel(source.rglabel)); // TODO new type
	ifDef(result, 'charge', source.charge, schema.charge.default);
	ifDef(result, 'explicitValence', source.explicitValence, schema.explicitValence.default);
	ifDef(result, 'isotope', source.isotope, schema.isotope.default);
	ifDef(result, 'radical', source.radical, schema.radical.default);
	ifDef(result, 'attachmentPoints', source.attpnt, schema.attachmentPoints.default);
	// stereo
	ifDef(result, 'stereoParity', source.stereoCare, schema.stereoParity.default);
	ifDef(result, 'weight', source.weight, schema.weight.default);
	// query
	ifDef(result, 'ringBondCount', source.ringBondCount, schema.ringBondCount.default);
	ifDef(result, 'substitutionCount', source.substitutionCount, schema.substitutionCount.default);
	ifDef(result, 'unsaturatedAtom', !!source.unsaturatedAtom, schema.unsaturatedAtom.default);
	ifDef(result, 'hCount', source.hCount, schema.hCount.default);
	// reaction
	ifDef(result, 'mapping', parseInt(source.aam), schema.mapping.default);
	ifDef(result, 'invRet', source.invRet, schema.invRet.default);
	ifDef(result, 'exactChangeFlag', !!source.exactChangeFlag, schema.exactChangeFlag.default);

	return result;
// 	return schemify(result, structSchema.atom);
}

export function bondToGraph(source) {
	const schema = structSchema.bond.properties;
	const result = {};

	ifDef(result, 'type', source.type);
	ifDef(result, 'atoms', [source.begin, source.end]);
	ifDef(result, 'stereo', source.stereo, schema.stereo.default);
	ifDef(result, 'topology', source.topology, schema.topology.default);
	ifDef(result, 'center', source.reactingCenterStatus, schema.center.default);

	return result;
// 	return schemify(result, structSchema.bond);
}

export function sgroupToGraph(source) {
	const result = {};
	let schema;

	ifDef(result, 'type', source.type);
	ifDef(result, 'atoms', source.atoms);

	switch (source.type) {
		case 'GEN':
			break;
		case 'MUL': {
			schema = structSchema.sgroup.allOf[1].oneOf[1].properties;
			ifDef(result, 'mul', source.data.mul || schema.mul.default);
			break;
		}
		case 'SRU': {
			schema = structSchema.sgroup.allOf[1].oneOf[2].properties;
			ifDef(result, 'subscript', source.data.subscript || schema.subscript.default);
			ifDef(result, 'connectivity', source.data.connectivity || schema.connectivity.default);
			break;
		}
		case 'SUP': {
			schema = structSchema.sgroup.allOf[1].oneOf[3].properties;
			ifDef(result, 'name', source.data.name || schema.name.default);
			break;
		}
	}

//	type = DAT
// 	ifDef(result, 'fieldName', source.data.fieldName);
// 	ifDef(result, 'fieldData', source.data.fieldValue);//
// 	ifDef(result, 'query', source.data.query, '');
// 	ifDef(result, 'queryOp', source.data.queryOp, '');

	return result;
// 	return schemify(result, structSchema.sgroup);
}

export function rgroupLogicToGraph(source) {
	const rgnumber = source[0];
	const rglogic = source[1];

	const schema = structSchema.rgroup.properties;
	const result = {};

	ifDef(result, 'number', rgnumber);
	ifDef(result, 'range', rglogic.range, schema.range.default);
	ifDef(result, 'resth', rglogic.resth, schema.resth.default);
	ifDef(result, 'ifthen', rglogic.ifthen, schema.ifthen.default);

	return result;
}


//
// function composeFieldDisp(pp, data) {
// 	const buttons = `${data.attached ? 'A' : 'D'}${data.absolute ? 'A' : 'R'}${data.showUnits ? 'U' : ' '}`;
// 	const nCharnCharsToDisplay = data.nCharnCharsToDisplay >= 0 ? data.nCharnCharsToDisplay : 'ALL';
// 	const tagChar = (data.tagChar && data.tagChar) === '' ? 1 : data.tagChar;
//
// 	return `  ${pp.x.toFixed(4)}    ${(-pp.y).toFixed(4)}    ${buttons}   ${nCharnCharsToDisplay}  ${tagChar}       ${data.daspPos}  `;
// }
//
// export function rgroupToSchema(source) {
// 	return {
// 		rlogic: source.getAttrs()
// 	}
// }
