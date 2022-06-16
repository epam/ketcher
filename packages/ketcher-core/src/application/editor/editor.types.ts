/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

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

interface Selection {
  atoms?: Array<number>
  bonds?: Array<number>
  enhancedFlags?: Array<number>
  rxnPluses?: Array<number>
  rxnArrows?: Array<number>
}

export interface Editor {
  isDitrty: () => boolean
  setOrigin: () => void
  struct: (struct?: Struct) => Struct
  subscribe: (eventName: string, handler: (data?: any) => any) => any
  unsubscribe: (eventName: string, subscriber: any) => void
  selection: (arg?: Selection | 'all' | null) => Selection | null
  undo: () => void
  redo: () => void
  clear: () => void
  options: (value?: any) => any
  zoom: (value?: number) => number
  structSelected: () => Struct
}
