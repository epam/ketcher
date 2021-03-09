import { ifDef } from '../../utils'
import { moleculeToStruct } from './moleculeToStruct'
import { RGroup } from 'ketcher-core'

export function rgroupToStruct(graphItem) {
  const struct = moleculeToStruct(graphItem)
  const rgroup = rgroupLogicToStruct(graphItem.rlogic)
  struct.frags.forEach((value, key) => {
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
