import jsonschema from 'jsonschema'

import structSchema from '../../../src/script/format/schemes/moleculeSchema'
import rgroupSchema from '../../../src/script/format/schemes/rgroupSchema'
import {
  plusSchema,
  arrowSchema
} from '../../../src/script/format/schemes/rxnSchemas'
import graphSchema from '../../../src/script/format/schemes/rootSchema'
import testGraph from './data/testGraph.json'

const v = new jsonschema.Validator()
v.addSchema(structSchema, '/Molecule')
v.addSchema(rgroupSchema, '/RGroup')
v.addSchema(arrowSchema, '/RxnArrow')
v.addSchema(plusSchema, '/RxnPlus')

const testErrors = JSON.parse(JSON.stringify(testGraph))
testErrors.mol0.atoms[0].alias = 555
const falsyRes = v.validate(testErrors, graphSchema)

test('validator', () => {
  const graph = testGraph
  const res = v.validate(graph, graphSchema)
  expect(res.errors.length).toBe(0)
})

describe('Errors', () => {
  it('atom label error message', () => {
    expect(falsyRes.errors.length).not.toBe(0)
  })
})
