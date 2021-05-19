import { ifDef } from 'utils'
import { moleculeToStruct } from './moleculeToStruct'
import { RGroup, Struct } from 'chemistry/entities'

export function rgroupToStruct(graphItem): Struct {
  const struct = moleculeToStruct(graphItem)
  const rgroup = rgroupLogicToStruct(graphItem.rlogic)
  struct.frags.forEach((_value: any, key) => {
    rgroup.frags.add(key)
  })
  if (graphItem.rlogic) struct.rgroups.set(graphItem.rlogic.number, rgroup)
  return struct
}

export function rgroupLogicToStruct(rglogic) {
  const params = {}
  ifDef(params, 'range', rglogic.range)
  ifDef(params, 'resth', rglogic.resth)
  ifDef(params, 'ifthen', rglogic.ifthen)

  return new RGroup(params)
}
