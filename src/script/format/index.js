import { atomToGraph, bondToGraph, sgroupToGraph, rgroupLogicToGraph } from './structToGraph';

export function toGraph(struct) {
	const result = {};

	const rgFrags = new Set();
	for (let [rgnumber, rgroup] of struct.rgroups.entries()) {
		Array.from(rgroup.frags.values()).forEach(frid => rgFrags.add(frid));

		console.log(struct.rgroups.entries());
		result[`rg-${rgnumber}`] = rgroupToGraph(struct, rgnumber, rgroup);
	}

	for (const fid of struct.frags.keys()) {
		if (!rgFrags.has(fid)) {
			const fragment = struct.getFragment(fid);
			result[`mol-${fid}`] = moleculeToGraph(fragment);
		}
	}

	return result;
}

export function rgroupToGraph(struct, rgnumber, rgroup) {
	const header = {
		type: 'rgroup'
	};

	console.log(rgroup);
	const frid = Array.from(rgroup.frags.values())[0];
	const fragment = struct.getFragment(frid);

	const body = {
		rlogic: rgroupLogicToGraph([rgnumber, rgroup]),
		...moleculeToGraph(fragment), // TODO: more than one
	};

	return {
		...body,
		...header
	}
}


export function moleculeToGraph(struct) {
// 	const structToSave = struct.clone(); // reindex atoms
	const header = {
		type: 'molecule',
		// moleculeName: struct.name
	};

	const body = {
		atoms: Array.from(struct.atoms.values()).map(atomToGraph),
	};

	if (struct.bonds.size !== 0)
		body.bonds = Array.from(struct.bonds.values()).map(bondToGraph);

	if (struct.sgroups.size !== 0)
		body.sgroups = Array.from(struct.sgroups.values()).map(sgroupToGraph);

	return {
		...header,
		...body
	}
}
