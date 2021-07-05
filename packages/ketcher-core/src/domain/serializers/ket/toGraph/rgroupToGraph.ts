import { Struct } from 'domain/entities'
import { ifDef } from 'utils'
import { moleculeToGraph } from './moleculeToGraph'

export function rgroupToGraph(struct: Struct, data) {
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
  const result = {}

  ifDef(result, 'number', rgnumber)
  ifDef(result, 'range', rglogic.range, '')
  ifDef(result, 'resth', rglogic.resth, false)
  ifDef(result, 'ifthen', rglogic.ifthen, 0)

  return result
}
