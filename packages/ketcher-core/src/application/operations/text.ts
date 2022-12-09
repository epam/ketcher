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

import { Struct, Text, TextAttributes, Vec2 } from 'domain/entities'

import { BaseOperation } from './baseOperation'
import { PerformOperationResult } from './operations.types'
import assert from 'assert'

export class AddText extends BaseOperation {
  #textAttributes: TextAttributes
  #textId?: number

  constructor(textAttributes: TextAttributes, textId?: number) {
    assert(textAttributes != null)

    super('TEXT_ADD')

    this.#textAttributes = textAttributes
    this.#textId = textId
  }

  execute(struct: Struct): PerformOperationResult {
    const text = new Text(this.#textAttributes)

    let textId: number
    if (typeof this.#textId !== 'number') {
      textId = struct.texts.add(text)
    } else {
      struct.texts.set(this.#textId, text)
      textId = this.#textId
    }

    // TODO: move to renderer
    // restruct.texts.set(itemId, new ReText(text))

    // BaseOperation.invalidateItem(restruct, 'texts', itemId, 1)

    const inverseOperation = new DeleteText(textId)

    return { inverseOperation, entityId: textId, operationType: this.type }
  }
}

export class DeleteText extends BaseOperation {
  #textId: number

  constructor(textId: number) {
    super('TEXT_DELETE')

    this.#textId = textId
  }

  execute(struct: Struct): PerformOperationResult {
    const text = struct.texts.get(this.#textId)!

    // TODO: move to renderer
    // restruct.markItemRemoved()
    // restruct.clearVisel(restruct.texts.get(this.data.id)!.visel)
    // restruct.texts.delete(this.data.id)

    struct.texts.delete(this.#textId)

    const inverseOperation = new AddText(text, this.#textId)

    return {
      inverseOperation,
      entityId: this.#textId,
      operationType: this.type
    }
  }
}

export class MoveText extends BaseOperation {
  #textId: number
  #delta: Vec2

  constructor(textId: number, delta: Vec2) {
    assert(delta != null)

    super('TEXT_MOVE')

    this.#textId = textId
    this.#delta = delta
  }

  execute(struct: Struct): PerformOperationResult {
    const text = struct.texts.get(this.#textId)!

    text.position.add_(this.#delta)

    // TODO: move to renderer
    // restruct.texts
    //   .get(id)
    //   ?.visel.translate(Scale.increaseBy(difference, restruct.render.options))

    const inverseOperation = new MoveText(this.#textId, this.#delta.negated())

    return {
      inverseOperation,
      entityId: this.#textId,
      operationType: this.type
    }

    // if (!this.data.noinvalidate) {
    //   BaseOperation.invalidateItem(restruct, 'texts', id, 1)
    // }
  }
}

export class UpdateText extends BaseOperation {
  #textId: number
  #content: string

  constructor(textId: number, content: string) {
    super('TEXT_UPDATE')

    this.#textId = textId
    this.#content = content
  }

  execute(struct: Struct): PerformOperationResult {
    const text = struct.texts.get(this.#textId)!
    const previousContent = text.content

    text.content = this.#content

    const inverseOperation = new UpdateText(this.#textId, previousContent)

    return {
      inverseOperation,
      entityId: this.#textId,
      operationType: this.type
    }

    // BaseOperation.invalidateItem(restruct, 'texts', id, 1)
  }
}
