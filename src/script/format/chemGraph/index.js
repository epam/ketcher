import Struct from '../../chem/struct';
import { moleculeToGraph } from './toGraph/moleculeToGraph';
import { rgroupToGraph } from './toGraph/rgroupToGraph';
import { moleculeToStruct } from './fromGraph/moleculeToStruct';
import { rgroupToStruct } from './fromGraph/rgroupToStruct';
import { arrowToGraph, plusToGraph } from './toGraph/rxnToGraph';
import { rxnToStruct } from './fromGraph/rxnToStruct';

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
	const resultingStruct = new Struct();
	const nodes = graph.root.nodes;
	Object.keys(nodes).forEach((i) => {
		if (nodes[i].type) parseNode(nodes[i], nodes[i].type, null, resultingStruct);
		else if (nodes[i].$ref)
			parseNode(graph[nodes[i].$ref], graph[nodes[i].$ref].type, nodes[i].$ref, structs);
	});
	structs.forEach((item) => {
		item.mergeInto(resultingStruct);
	});
	return resultingStruct;
}

function parseNode(node, type, key, struct) {
	switch (type) {
		case 'arrow':
			rxnToStruct(node, struct);
			break;
		case 'plus':
			rxnToStruct(node, struct);
			break;
		case 'molecule':
			struct.set(key, moleculeToStruct(node));
			break;
		case 'rgroup':
			struct.set(key, rgroupToStruct(node));
			break;
		default:
			break;
	}
}

export default {
	toGraph,
	fromGraph
};
