import { Action } from 'application/actions'
import { Struct } from 'domain/entities'

export interface EditorHistory {
  readonly current?: number
  readonly length: number
  push: (action: Action) => EditorHistory
  pop: () => Action
}

export interface LoadOptions {
  rescale: boolean
  fragment: boolean
}

export interface Editor {
  isDitrty: () => boolean
  setOrigin: () => void
  struct: (struct?: Struct) => Struct
}
