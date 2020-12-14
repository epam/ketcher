import rgroupSchema from '../../schemes/rgroupSchema'
import { moleculeToGraph } from './moleculeToGraph'

import { ifDef } from '../../utils'

export function rgroupToGraph(struct, data) {
  const body = {
    rlogic: rgroupLogicToGraph(data.rgnumber, data.rgroup),
    ...moleculeToGraph(struct)
  }

  return {
    ...body,
    type: 'rgroup'
  }
}

function rgroupLogicToGraph(rgnumber, rglogic) {
  const schema = rgroupSchema.logic.properties
  const result = {}

  ifDef(result, 'number', rgnumber)
  ifDef(result, 'range', rglogic.range, schema.range.default)
  ifDef(result, 'resth', rglogic.resth, schema.resth.default)
  ifDef(result, 'ifthen', rglogic.ifthen, schema.ifthen.default)

  return result
}
