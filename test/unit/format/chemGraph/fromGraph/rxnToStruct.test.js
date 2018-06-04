import { rxnToStruct } from '../../../../../src/script/format/chemGraph/fromGraph/rxnToStruct';
import Struct from '../../../../../src/script/chem/struct/index';
import testGraph from '../../data/testGraph.json';

test('rxn to struct test', () => {
	expect(rxnToStruct(testGraph.mol0, new Struct())).toBeTruthy();
});

