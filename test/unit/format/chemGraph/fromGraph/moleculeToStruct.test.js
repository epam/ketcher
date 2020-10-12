import { moleculeToStruct, atomToStruct, rglabelToStruct, atomListToStruct } from '../../../../../src/script/format/chemGraph/fromGraph/moleculeToStruct';
import testGraph from '../../data/testGraph.json';
import { Atom, Bond, SGroup } from '../../../../../src/script/chem/struct';

const struct = moleculeToStruct(testGraph.mol0);

describe('Content of the molecule', () => {
	it('should contain atoms in struct', () => {
		expect(struct.atoms.get(0)).toBeDefined();
	});
	it('should contain bonds in struct', () => {
		expect(struct.bonds.get(0)).toBeDefined();
	});
	it('should contain sgroups in struct', () => {
		expect(struct.sgroups.get(0)).toBeUndefined();
	});
	it('should contain frags in struct', () => {
		expect(struct.frags.get(0).enhancedStereoFlag).toBeNull();
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

describe('Atom should contain', () => {
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
		expect(struct.atoms.get(2).stereoParity).toBe(1);
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

describe('rglabel should contain', () => {
	it('location', () => {
		expect(struct.atoms.get(0).pp).toEqual({ x: 1, y: 1.5, z: 0 });
	});
	it('attachmentPoints', () => {
		expect(struct.atoms.get(0).attpnt).toBeNull();
	});
	it('rglabel', () => {
		expect(struct.atoms.get(0).rglabel).toBeNull();
	});
});

describe('atomList should contain', () => {
	it('location', () => {
		expect(struct.atoms.get(0).pp).toEqual({ x: 1, y: 1.5, z: 0 });
	});
	it('attachmentPoints', () => {
		expect(struct.atoms.get(0).attpnt).toBeNull();
	});
	it('atomList', () => {
		expect(struct.atoms.get(0).atomList).toBeNull();
	});
});

describe('bond should contain', () => {
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

describe('sgroup should contain', () => {
	let sgroup = new SGroup('MUL');
	it('mul', () => {
		expect(sgroup.data.mul).toBe(1);
	});
	sgroup = new SGroup('SRU');
	it('subscript', () => {
		expect(sgroup.data.subscript).toBe("n");
	});
	it('connectivity', () => {
		expect(sgroup.data.connectivity).toBe("ht");
	});
	sgroup = new SGroup('SUP');
	it('name', () => {
		expect(sgroup.data.name).toBe("");
	});
	sgroup = new SGroup('DAT');
	it('absolute', () => {
		expect(sgroup.data.placement).toBeUndefined();
	});
	it('attached', () => {
		expect(sgroup.data.display).toBeUndefined();
	});
	it('context', () => {
		expect(sgroup.data.context).toBeUndefined();
	});
	it('fieldName', () => {
		expect(sgroup.data.fieldName).toBe('');
	});
	it('fieldValue', () => {
		expect(sgroup.data.fieldData).toBeUndefined();
	});
});
