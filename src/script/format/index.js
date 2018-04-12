import { atomToGraph, bondToGraph } from './structToGraph';

export function toGraph(struct) {
	const header = {
		moleculeName: struct.name
	};

	//TODO: reindex ????

	const body = {
		atoms: Array.from(struct.atoms.values()).map(atomToGraph),
		bonds: Array.from(struct.bonds.values()).map(bondToGraph)
	};

	return {
		...header,
		...body
	}

// 	const molfile = new Molfile();
// 	molfile.molecule = struct;
// 	molfile.prepareSGroups();
//
// 	const result = {
// 		moleculeName: struct.name,
// 		rootCtab: {
// 			atoms: struct.atoms.values().map(atomToGraph)
// 		}
// 	};
//
// 	const bonds = struct.bonds.values().map(bondToSchema);
// 	if (bonds.length !== 0)
// 		result.rootCtab.bonds = bonds;
//
// 	const sgroups = struct.sgroups.values().map(sgroupToSchema);
// 	if (sgroups.length !== 0)
// 		result.rootCtab.sgroups = sgroups;
//
// 	const rgroups = struct.rgroups.values().map(rgroupToSchema);
// 	if (rgroups.length !== 0)
// 		result.rgroups = rgroups;
//
// 	return result;
}
