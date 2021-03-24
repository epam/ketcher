import { Vec2 } from 'ketcher-core'
import { TextCreate, TextUpdate, TextDelete } from '../operations'
import Action from '../shared/action'
import Restruct from '../../render/restruct'

interface TextElemData {
  id: any
  type: string
  position: Vec2
  label: string
  previousLabel?: string
}

export function fromTextCreation(restruct: Restruct, elem: TextElemData) {
  const action = new Action()
  const { id, label, position, type } = elem
  action.addOp(new TextCreate(id, label, position, type))
  return action.perform(restruct)
}

export function fromTextUpdating(restruct: Restruct, elem: TextElemData) {
  const action = new Action()
  const { id, label, position, type, previousLabel } = elem
  action.addOp(new TextUpdate(id, label, position, type, previousLabel))
  return action.perform(restruct)
}

export function fromTextDeletion(restruct: Restruct, elem: TextElemData) {
  const action = new Action()
  const { id, label, position, type } = elem

  action.addOp(new TextDelete(id, label, position, type))

  return action.perform(restruct)
}
