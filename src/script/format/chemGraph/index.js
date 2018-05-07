import Struct from '../../chem/struct';
import { moleculeToGraph } from './toGraph/moleculeToGraph';
import { rgroupToGraph } from './toGraph/rgroupToGraph';
import { moleculeToStruct } from './fromGraph/moleculeToStruct';
import { rgroupToStruct } from './fromGraph/rgroupToStruct';
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

function fromGraph(graph) {
	const structs = new Map();
	structs.rxnArrows = [];
	structs.rxnPluses = [];
	const nodes = graph.root.nodes;
	Object.keys(graph).forEach((key) => {
		switch (graph[key].type) {
			case 'molecule':
				structs.set(key, moleculeToStruct(graph[key]));
				break;
			case 'rgroup':
				structs.set(key, rgroupToStruct(graph[key]));
				break;
			default:
				if (nodes) {
					Object.keys(nodes).forEach((i) => {
						switch (nodes[i].type) {
							case 'arrow':
								structs.rxnArrows.push(nodes[i]);
								break;
							case 'plus':
								structs.rxnPluses.push(nodes[i]);
								break;
							default:
								break;
						}
					});
				}
				break;
		}
	});
	const resultingStruct = new Struct();
	structs.forEach((item) => {
		item.mergeInto(resultingStruct);
	});
	resultingStruct.rxnArrows = structs.rxnArrows;
	resultingStruct.rxnPluses = structs.rxnPluses;
	return resultingStruct;
}

export default {
	toGraph,
	fromGraph
};
