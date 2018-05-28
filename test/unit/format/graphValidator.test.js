import jsonschema from 'jsonschema';

import structSchema from '../../../src/script/format/schemes/moleculeSchema';
import rgroupSchema from '../../../src/script/format/schemes/rgroupSchema';
import { plusSchema, arrowSchema } from '../../../src/script/format/schemes/rxnSchemas';
import graphSchema from '../../../src/script/format/schemes/rootSchema';
import { testGraph } from './data/testGraph';

const v = new jsonschema.Validator();
v.addSchema(structSchema, '/Molecule');
v.addSchema(rgroupSchema, '/RGroup');
v.addSchema(arrowSchema, '/RxnArrow');
v.addSchema(plusSchema, '/RxnPlus');

const res = v.validate(testGraph, graphSchema);

test('validator', () => {
	expect(res).toBeTruthy();
});

console.log(v);

