import { moleculeToStruct } from '../../../../../src/script/format/chemGraph/fromGraph/moleculeToStruct';
import testGraph from '../../data/testGraph.json';
import { Atom, Bond } from '../../../../../src/script/chem/struct';

const struct = moleculeToStruct(testGraph.mol0);

describe('Content of the molecule', () => {
	it('are atoms exist in struct', () => {
		expect(struct.atoms.get(0)).toBeDefined();
	});
	it('are bonds exists in struct', () => {
		expect(struct.bonds.get(0)).toBeDefined();
	});
	it('are sgroups exists in struct', () => {
		expect(struct.sgroups.get(0)).toBeUndefined();
	});
});

describe('Check instances of elements', () => {
	it('atom`s instance', () => {
		struct.atoms.forEach((atom) => {
			expect(atom).toBeInstanceOf(Atom);
		});
	});
	it('bond`s instances', () => {
		struct.bonds.forEach((bond) => {
			expect(bond).toBeInstanceOf(Bond);
		});
	});
});

describe('Is atom contains', () => {
	it('alias', () => {
		expect(struct.atoms.get(0).alias).toBe('superatom');
	});
	it('location', () => {
		expect(struct.atoms.get(0).pp).toEqual({ x: 1, y: 1.5, z: 0 });
	});
	it('isotope', () => {
		expect(struct.atoms.get(0).isotope).toBe(5);
	});
	it('charge', () => {
		expect(struct.atoms.get(1).charge).toBe(50);
	});
	it('explicitValence', () => {
		expect(struct.atoms.get(1).explicitValence).toBe(2);
	});
	it('attachmentPoints', () => {
		expect(struct.atoms.get(1).attpnt).toBe(3);
	});
	it('radical', () => {
		expect(struct.atoms.get(1).radical).toBe(2);
	});
	it('stereoParity', () => {
		expect(struct.atoms.get(2).stereoParity).toBeUndefined();
	});
	it('weight', () => {
		expect(struct.atoms.get(2).weight).toBeUndefined();
	});
	it('substitutionCount', () => {
		expect(struct.atoms.get(2).substitutionCount).toBe(-2);
	});
	it('unsaturatedAtom', () => {
		expect(struct.atoms.get(2).unsaturatedAtom).toBeTruthy();
	});
	it('hCount', () => {
		expect(struct.atoms.get(2).hCount).toBe(3);
	});
	it('mapping', () => {
		expect(struct.atoms.get(2).aam).toBe(5);
	});
	it('invRet', () => {
		expect(struct.atoms.get(2).invRet).toBe(1);
	});
	it('exactChangeFlag', () => {
		expect(struct.atoms.get(2).exactChangeFlag).toBeTruthy();
	});
});

describe('Is bond contains', () => {
	it('type', () => {
		expect(struct.bonds.get(0).type).toBe(1);
	});
	it('begin atom', () => {
		expect(struct.bonds.get(0).begin).toBe(0);
	});
	it('end atom', () => {
		expect(struct.bonds.get(0).end).toBe(1);
	});
});

describe('element`s length', () => {
	it('atom`s length', () => {
		expect(struct.atoms.size).toBe(3);
	});
	it('bond`s length', () => {
		expect(struct.bonds.size).toBe(2);
	});
});
