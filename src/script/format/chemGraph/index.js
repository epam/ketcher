import Pile from '../../util/pile';
import Struct from '../../chem/struct';
import { moleculeToGraph } from './toGraph/moleculeToGraph';
import { rgroupToGraph } from './toGraph/rgroupToGraph';
import { atomToStruct, bondToStruct, sgroupToStruct, rgroupLogicToStruct } from './fromGraph/moleculeToStruct';

function toGraph(struct) {
	const result = {};

	const rgFrags = new Set(); // skip this when writing molecules
	for (const [rgnumber, rgroup] of struct.rgroups.entries()) { // RGroups writing
		rgroup.frags.forEach(frid => rgFrags.add(frid));

		const fragsAtoms = Array.from(rgroup.frags.values())
			.reduce((res, frid) => res.union(struct.getFragmentIds(frid)), new Pile());

		result[`rg-${rgnumber}`] = rgroupToGraph(struct.clone(fragsAtoms), rgnumber, rgroup);
	}

	const molFrags = Array.from(struct.frags.keys()).filter(fid => !rgFrags.has(fid));

	for (const fid of molFrags) { // Molecules writing
		const fragment = struct.getFragment(fid);
		result[`mol-${fid}`] = moleculeToGraph(fragment);
	}

	return result;
}

function fromGraph(graph) {
	const mol = /mol/i;
	const structs = new Map();
	for (const key in graph) {
		if (mol.test(key)) {
			const struct = new Struct();
			graph[key].atoms.forEach(atom => struct.atoms.add(atomToStruct(atom)));

			if (graph[key].bonds)
				graph[key].bonds.forEach(bond => struct.bonds.add(bondToStruct(bond)));

			if (graph[key].sgroups) {
				graph[key].sgroups.forEach(sgroup => struct.sgroups.add(sgroupToStruct(sgroup)));

				if (graph[key].sgroups.forEach(sgroup => sgroup.type === 'MUL')) {
					graph[key].atoms = collapseMulAtoms(graph.atoms);
					graph[key].bonds = collapseMulBonds(graph.bonds, graph.atoms.map((a, i) => i));
				}
			}
			struct.initHalfBonds();
			struct.initNeighbors();
			struct.markFragments();
			structs.set(key, struct);
		}
		const struct = new Struct();
		graph[key].atoms.forEach(atom => struct.atoms.add(atomToStruct(atom)));

		if (graph[key].bonds)
			graph[key].bonds.forEach(bond => struct.bonds.add(bondToStruct(bond)));

		if (graph[key].sgroups) {
			graph[key].sgroups.forEach(sgroup => struct.sgroups.add(sgroupToStruct(sgroup)));

			if (graph[key].sgroups.forEach(sgroup => sgroup.type === 'MUL')) {
				graph[key].atoms = collapseMulAtoms(graph.atoms);
				graph[key].bonds = collapseMulBonds(graph.bonds, graph.atoms.map((a, i) => i));
			}
		}
		if (graph[key].rlogic)
			struct.rgroups.add(rgroupLogicToStruct(graph[key].rlogic.number, graph[key].rlogic));
		struct.initHalfBonds();
		struct.initNeighbors();
		struct.markFragments();
		structs.set(key, struct);
	}
	return structs;
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

export default {
	toGraph,
	fromGraph
};
