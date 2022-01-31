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

import {
  StructService,
  StructServiceOptions,
  StructServiceProvider
} from 'domain/services'

import { Editor } from 'application/editor'
import { FormatterFactory } from 'application/formatters'
import { Ketcher } from './ketcher'
import assert from 'assert'

const DefaultStructServiceOptions = {
  'smart-layout': true,
  'ignore-stereochemistry-errors': true,
  'mass-skip-error-on-pseudoatoms': false,
  'gross-formula-add-rsites': true,
  'aromatize-skip-superatoms': true
}

export class KetcherBuilder {
  #structServiceProvider?: StructServiceProvider

  withStructServiceProvider(
    structServiceProvider: StructServiceProvider
  ): KetcherBuilder {
    this.#structServiceProvider = structServiceProvider
    return this
  }

  build(editor: Editor, serviceOptions?: StructServiceOptions): Ketcher {
    assert(editor != null)
    assert(this.#structServiceProvider != null)

    const mergedServiceOptions: StructServiceOptions = {
      ...DefaultStructServiceOptions,
      ...serviceOptions
    }
    const structService: StructService =
      this.#structServiceProvider!.createStructService(mergedServiceOptions)
    // @ts-ignore
    const ketcher = new Ketcher(
      editor,
      structService,
      new FormatterFactory(structService)
    )
    ketcher[this.#structServiceProvider.mode] = true

    return ketcher
  }
}
