import { TextCreate, TextDelete, TextUpdate } from '../operations'

import Action from '../shared/action'
import Restruct from '../../render/restruct'
import { Vec2 } from 'ketcher-core'

export function fromTextCreation(
  restruct: Restruct,
  content: string,
  position: Vec2
) {
  const action = new Action()
  action.addOp(new TextCreate(content, position))
  return action.perform(restruct)
}

export function fromTextUpdating(
  restruct: Restruct,
  id: number,
  content: string
) {
  const action = new Action()
  action.addOp(new TextUpdate(id, content))
  return action.perform(restruct)
}

export function fromTextDeletion(restruct: Restruct, id: number) {
  const action = new Action()

  action.addOp(new TextDelete(id))

  return action.perform(restruct)
}
