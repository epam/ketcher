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

import { Vec2 } from './Vec2'

//TODO: move to infrastructure
export enum TextCommand {
  Bold = 'BOLD',
  Italic = 'ITALIC',
  Subscript = 'SUBSCRIPT',
  Superscript = 'SUPERSCRIPT'
}

export interface TextParams {
  //TODO: add Interface for content type
  content?: string
  position?: Vec2
}

export class Text {
  content: string
  position: Vec2

  constructor(params: TextParams) {
    params = params || {}
    this.content = params.content || ''
    this.position = params.position ? new Vec2(params.position) : new Vec2()
  }

  clone(): Text {
    return new Text(this)
  }
}
