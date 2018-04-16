import Pile from '../../util/pile';

import { moleculeToGraph } from './toGraph/moleculeToGraph';
import { rgroupToGraph } from './toGraph/rgroupToGraph';

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

export default {
	toGraph,
	fromGraph: () => null
};
