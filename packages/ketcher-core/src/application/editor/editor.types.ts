import { Action } from './../actions'
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
  readonly history: EditorHistory

  struct: () => Struct
  load: (structure: string, options: LoadOptions) => Promise<void>
}
