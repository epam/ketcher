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
  FormatterFactory,
  Ketcher,
  ServiceMode,
  StructService,
  StructServiceProvider
} from 'ketcher-core'

import { ButtonsConfig } from './ButtonsConfig'
import { Editor } from '../../editor'
import createApi from '../../api'
import { initApp } from '../../ui'

class KetcherBuilder {
  private structService: StructService | null
  private editor: Editor | null
  private serviceMode: ServiceMode | null
  private formatterFactory: FormatterFactory | null

  constructor() {
    this.structService = null
    this.editor = null
    this.serviceMode = null
    this.formatterFactory = null
  }

  async appendApiAsync(structServiceProvider: StructServiceProvider) {
    this.structService = createApi(structServiceProvider, {
      'smart-layout': true,
      'ignore-stereochemistry-errors': true,
      'mass-skip-error-on-pseudoatoms': false,
      'gross-formula-add-rsites': true,
      'aromatize-skip-superatoms': true
    })
  }

  appendServiceMode(mode: ServiceMode) {
    this.serviceMode = mode
  }

  async appendUiAsync(
    element: HTMLDivElement | null,
    staticResourcesUrl: string,
    errorHandler: (message: string) => void,
    buttons?: ButtonsConfig,
    settings?: any
  ): Promise<void> {
    const { structService } = this

    const editor = await new Promise<Editor>((resolve) => {
      initApp(
        element,
        staticResourcesUrl,
        {
          buttons: buttons || {},
          errorHandler: errorHandler || null,
          version: process.env.VERSION || '',
          buildDate: process.env.BUILD_DATE || '',
          buildNumber: process.env.BUILD_NUMBER || '',
          settings: settings
        },
        structService!,
        resolve
      )
    })

    this.editor = editor
    this.editor.errorHandler =
      errorHandler && typeof errorHandler === 'function'
        ? errorHandler
        : // eslint-disable-next-line @typescript-eslint/no-empty-function
          () => {}
    this.formatterFactory = new FormatterFactory(structService!)
  }

  build() {
    if (!this.serviceMode) {
      throw new Error('You should append ServiceMode before building')
    }

    if (!this.structService) {
      throw new Error('You should append Api before building')
    }

    if (!this.formatterFactory) {
      throw new Error(
        'You should append StructureServiceFactory before building'
      )
    }

    const ketcher = new Ketcher(
      this.editor!,
      this.structService,
      this.formatterFactory
    )
    ketcher[this.serviceMode] = true

    const params = new URLSearchParams(document.location.search)
    const initialMol = params.get('moll')
    if (initialMol) {
      ketcher.setMolecule(initialMol)
    }

    return ketcher
  }
}

export { KetcherBuilder }
