import { TextCreate, TextUpdate, TextDelete } from '../operations'
import Action from '../shared/action'

export function fromTextCreation(restruct, elem) {
  const action = new Action()
  const { id, label, position, type } = elem
  action.addOp(new TextCreate(id, label, position, type))
  return action.perform(restruct)
}

export function fromTextUpdating(restruct, id, elem) {
  const action = new Action()
  const { label, invertedLabel } = elem
  action.addOp(new TextUpdate(id, label, invertedLabel))
  return action.perform(restruct)
}

export function fromTextDeletion(restruct, elem) {
  const action = new Action()
  const { id } = elem

  action.addOp(new TextDelete(id))

  return action.perform(restruct)
}
