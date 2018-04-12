import structSchema from './structSchema';
import { /*schemify,*/ ifDef } from './utils';

import { fromRlabel } from './convertStruct';

export function atomToGraph(source) {
	const schema = structSchema.atom.properties;
	const result = {};

	ifDef(result, 'label', source.label);
	ifDef(result, 'alias', source.alias);
	ifDef(result, 'location', [source.pp.x, source.pp.y, source.pp.z]);
	ifDef(result, 'rgroups', fromRlabel(source.rglabel));
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
//
// export function sgroupToSchema(source) {
// 	const result = {};
//
// 	const mulSchema = structSchema.sgroup.oneOf[1].properties;
// 	const sruSchema = structSchema.sgroup.oneOf[2].properties;
//
// 	ifDef(result, 'type', source.type);
// 	ifDef(result, 'bracketBox', {
// 		leftSide: source.brkxyz[0],
// 		rightSide: source.brkxyz[1]
// 	});
// 	ifDef(result, 'atoms', source.atoms.map(i => i + 1));
// 	ifDef(result, 'bonds', source.bonds);
// 	ifDef(result, 'patoms', source.patoms ? source.patoms.map(i => i + 1) : source.patoms);
// 	ifDef(result, 'xbonds', source.xbonds);
// 	ifDef(result, 'mul', source.data.mul, mulSchema.mul.default);
// 	ifDef(result, 'subscript', source.type === 'SUP' ? source.data.name : source.data.subscript, sruSchema.subscript.default);
// 	ifDef(result, 'connectivity', source.data.connectivity, sruSchema.connectivity.default);
// 	ifDef(result, 'fieldName', source.data.fieldName);
// 	ifDef(result, 'fieldData', source.data.fieldValue);
//
// 	result.fieldDisp = source.pp ? composeFieldDisp(source.pp, source.data) : '';
//
// 	ifDef(result, 'query', source.data.query, '');
// 	ifDef(result, 'queryOp', source.data.queryOp, '');
//
// 	return schemify(result, structSchema.sgroup);
// }
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
