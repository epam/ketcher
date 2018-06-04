import Struct from '../../chem/struct';
import { headerToGraph } from './toGraph/headerToGraph';
import { moleculeToGraph } from './toGraph/moleculeToGraph';
import { rgroupToGraph } from './toGraph/rgroupToGraph';
import { arrowToGraph, plusToGraph } from './toGraph/rxnToGraph';

import { moleculeToStruct } from './fromGraph/moleculeToStruct';
import { rgroupToStruct } from './fromGraph/rgroupToStruct';
import { rxnToStruct } from './fromGraph/rxnToStruct';

import { prepareStructForGraph } from './toGraph/prepare';

function toGraph(struct) {
	const result = {
		root: {
			nodes: []
		}
	};

	const header = headerToGraph(struct);
	if (header) result.header = header;

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
	const resultingStruct = new Struct();
	resultingStruct.name = graph.header ? graph.header.moleculeName : null;

	const nodes = graph.root.nodes;
	Object.keys(nodes).forEach((i) => {
		if (nodes[i].type) parseNode(nodes[i], resultingStruct);
		else if (nodes[i].$ref)
			parseNode(graph[nodes[i].$ref], resultingStruct);
	});

	return resultingStruct;
}

function parseNode(node, struct) {
	const type = node.type;
	switch (type) {
		case 'arrow':
			rxnToStruct(node, struct);
			break;
		case 'plus':
			rxnToStruct(node, struct);
			break;
		case 'molecule':
			moleculeToStruct(node).mergeInto(struct);
			break;
		case 'rgroup':
			rgroupToStruct(node).mergeInto(struct);
			break;
		default:
			break;
	}
}

export default {
	toGraph,
	fromGraph
};
