import { moleculeToGraph } from './toGraph/moleculeToGraph';
import { rgroupToGraph } from './toGraph/rgroupToGraph';
import { arrowToGraph, plusToGraph } from './toGraph/rxnToGraph';

import { prepareStructForGraph } from './toGraph/prepare';

function toGraph(struct) {
	const result = {
		root: {
			nodes: []
		}
	};

	const graphNodes = prepareStructForGraph(struct);

	let moleculeId = 0;
	graphNodes.forEach((item) => {
		switch (item.type) {
			case 'molecule': {
				result.root.nodes.push({ $ref: `mol${moleculeId}` });
				result[`mol${moleculeId++}`] = moleculeToGraph(item.fragment);
				break;
			}
			case 'rgroup': {
				result.root.nodes.push({ $ref: `rg${item.data.rgnumber}` });
				result[`rg${item.data.rgnumber}`] = rgroupToGraph(item.fragment, item.data);
				break;
			}
			case 'plus': {
				result.root.nodes.push(plusToGraph(item));
				break;
			}
			case 'arrow': {
				result.root.nodes.push(arrowToGraph(item));
				break;
			}
			default: break;
		}
	});

	return result;
}

export default {
	toGraph,
	fromGraph: () => null
};
