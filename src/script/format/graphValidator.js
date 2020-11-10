import jsonschema from 'jsonschema'

import structSchema from './schemes/moleculeSchema'
import rgroupSchema from './schemes/rgroupSchema'
import { plusSchema, arrowSchema } from './schemes/rxnSchemas'
import graphSchema from './schemes/rootSchema'

export default function (graph) {
  const v = new jsonschema.Validator()
  v.addSchema(structSchema, '/Molecule')
  v.addSchema(rgroupSchema, '/RGroup')
  v.addSchema(arrowSchema, '/RxnArrow')
  v.addSchema(plusSchema, '/RxnPlus')

  const res = v.validate(graph, graphSchema)
  console.log(res)
}
