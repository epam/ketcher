import { atomToGraph, bondToGraph, sgroupToGraph, rgroupToGraph } from './structToGraph';

export function toGraph(struct) {
	const result = {};

	for (const fid of struct.frags.keys()) {
		const fragment = struct.getFragment(fid);
		result[`mol${fid}`] = moleculeToGraph(fragment);
	}

	return result;
}

export function moleculeToGraph(struct) {
// 	const structToSave = struct.clone(); // reindex atoms
	const header = {
		moleculeName: struct.name
	};

	const body = {
		atoms: Array.from(struct.atoms.values()).map(atomToGraph),
	};

	if (struct.bonds.size !== 0)
		body.bonds = Array.from(struct.bonds.values()).map(bondToGraph);

	if (struct.sgroups.size !== 0)
		body.sgroups = Array.from(struct.sgroups.values()).map(sgroupToGraph);

	if (struct.rgroups.size !== 0)
		body.rgroups = Array.from(struct.rgroups.entries()).map(rgroupToGraph);

	return {
		...header,
		...body
	}
}
