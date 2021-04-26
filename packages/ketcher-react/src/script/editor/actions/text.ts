import { Vec2 } from 'ketcher-core'
import { TextCreate, TextUpdate, TextDelete } from '../operations'
import Action from '../shared/action'
import Restruct from '../../render/restruct'
import { RawDraftContentState } from 'draft-js'

export interface TextElemData {
  id: any
  type: string
  position: Vec2
  rawContent: RawDraftContentState
  previousRawContent?: RawDraftContentState
}

export function fromTextCreation(restruct: Restruct, elem: TextElemData) {
  const action = new Action()
  const { id, rawContent, position, type } = elem
  action.addOp(new TextCreate(id, rawContent, position, type))
  return action.perform(restruct)
}

export function fromTextUpdating(restruct: Restruct, elem: TextElemData) {
  const action = new Action()
  const { id, rawContent, position, type, previousRawContent } = elem
  action.addOp(
    new TextUpdate(id, rawContent, position, type, previousRawContent)
  )
  return action.perform(restruct)
}

export function fromTextDeletion(restruct: Restruct, elem: TextElemData) {
  const action = new Action()
  const { id, rawContent, position, type } = elem

  action.addOp(new TextDelete(id, rawContent, position, type))

  return action.perform(restruct)
}
