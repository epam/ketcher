import structSchema from '../../schemes/moleculeSchema';

import { fromRlabel } from '../convertStruct';
import { ifDef } from '../../utils';

export function moleculeToGraph(struct) {
	const body = {
		atoms: Array.from(struct.atoms.values())
			.map((atom) => {
				if (atom.label === 'R#') return rglabelToGraph(atom);
				if (atom.label === 'L#') return atomListToGraph(atom);
				return atomToGraph(atom);
			})
	};

	if (struct.bonds.size !== 0)
		body.bonds = Array.from(struct.bonds.values()).map(bondToGraph);

	if (struct.sgroups.size !== 0)
		body.sgroups = Array.from(struct.sgroups.values()).map(sgroupToGraph);

	const fragment = struct.frags.get(0);
	ifDef(body, 'stereoFlag', fragment.enhancedStereoFlag, structSchema.properties.stereoFlag.default);

	return {
		type: 'molecule',
		...body
	};
}

function atomToGraph(source) {
	const schema = structSchema.atom.properties;
	const result = {};

	ifDef(result, 'label', source.label);
	ifDef(result, 'alias', source.alias);
	ifDef(result, 'location', [source.pp.x, source.pp.y, source.pp.z]);
	ifDef(result, 'charge', source.charge, schema.charge.default);
	ifDef(result, 'explicitValence', source.explicitValence, schema.explicitValence.default);
	ifDef(result, 'isotope', source.isotope, schema.isotope.default);
	ifDef(result, 'radical', source.radical, schema.radical.default);
	ifDef(result, 'attachmentPoints', source.attpnt, schema.attachmentPoints.default);
	// stereo
	ifDef(result, 'stereoLabel', source.stereoLabel, schema.stereoLabel.default);
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

function rglabelToGraph(source) {
	const schema = structSchema.rgatom.properties;
	const result = {
		type: 'rg-label'
	};
	ifDef(result, 'location', [source.pp.x, source.pp.y, source.pp.z]);
	ifDef(result, 'attachmentPoints', source.attpnt, schema.attachmentPoints.default);

	const refsToRGroups = fromRlabel(source.rglabel).map(rgnumber => `rg-${rgnumber}`);
	ifDef(result, '$refs', refsToRGroups);

	return result;
}

function atomListToGraph(source) {
	const schema = structSchema.atomlist.properties;
	const result = {
		type: 'atom-list'
	};
	ifDef(result, 'location', [source.pp.x, source.pp.y, source.pp.z]);
	ifDef(result, 'attachmentPoints', source.attpnt, schema.attachmentPoints.default);
	ifDef(result, 'elements', source.atomList.labelList());

	return result;
}

function bondToGraph(source) {
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

function sgroupToGraph(source) {
	const result = {};
	let schema;

	ifDef(result, 'type', source.type);
	ifDef(result, 'atoms', source.atoms);

	switch (source.type) {
		case 'GEN': break;
		case 'MUL': {
			schema = structSchema.sgroup.allOf[1].oneOf[1].properties;
			ifDef(result, 'mul', source.data.mul || schema.mul.default);
			break;
		}
		case 'SRU': {
			schema = structSchema.sgroup.allOf[1].oneOf[2].properties;
			ifDef(result, 'subscript', source.data.subscript || schema.subscript.default);
			ifDef(result, 'connectivity', source.data.connectivity.toUpperCase() || schema.connectivity.default);
			break;
		}
		case 'SUP': {
			schema = structSchema.sgroup.allOf[1].oneOf[3].properties;
			ifDef(result, 'name', source.data.name || schema.name.default);
			break;
		}
		case 'DAT': {
			schema = structSchema.sgroup.allOf[1].oneOf[4].properties;
			ifDef(result, 'context', source.data.context, schema.context.default);
			ifDef(result, 'fieldName', source.data.fieldName);
			ifDef(result, 'fieldData', source.data.fieldValue);
		}
		default: break;
	}

	return result;
// 	return schemify(result, structSchema.sgroup);
}
