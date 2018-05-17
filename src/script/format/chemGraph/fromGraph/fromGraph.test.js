import { rxnToStruct } from './rxnToStruct';
import { atomToStruct } from './moleculeToStruct';
import Struct from '../../../chem/struct';

const testGraph = {
	atoms: [
		{
			label: 'C',
			location: [1, 1, 0]
		},
		{
			label: 'C',
			location: [1, 1.5, 0]
		},
		{
			label: 'C',
			location: [1, 2, 0]
		}
	],
	bonds: [
		{
			type: 1,
			atoms: [0, 1]
		},
		{
			type: 1,
			atoms: [1, 2]
		}
	],
	root: {
		nodes: [
			{
				type: 'arrow',
				location: [0, 0, 0]
			},
			{
				$ref: 'mol0'
			}
		]
	}
};

test('rxn to struct test', () => {
	expect(rxnToStruct(testGraph, new Struct())).toBeTruthy();
});

function sum(a, b) {
	return a + b;
}

test('adds 1 + 2 to equal 3', () => {
	expect(sum(1, 2)).toBe(3);
});

describe('Atom to struct', () => {
	test('is return new Atom object', () => {
		expect(atomToStruct(testGraph.atoms[0])).toEqual({ label: 'C' });
	});
});

