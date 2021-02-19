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
  StructServiceProvider,
  FormatterFactory,
  ServiceMode
} from 'ketcher-core'
import createApi from '../../api'
import { Editor } from '../../editor'
import { Ketcher, UI as KetcherUI } from '../../ketcher'
import { initApp } from '../../ui'
import { ButtonsConfig } from './ButtonsConfig'
import { molfileManager } from '../../chem/molfile'
import smilesManager from '../../chem/smiles'
import graphManager from '../../format/chemGraph'

class KetcherBuilder {
  private structService: StructService | null
  private editor: Editor | null
  private serviceMode: ServiceMode | null
  private formatterFactory: FormatterFactory | null
  private ui: KetcherUI | null

  private tempUIDataContainer: null | {
    element: HTMLDivElement | null
    staticResourcesUrl: string
    buttons?: ButtonsConfig
  }

  constructor() {
    this.structService = null
    this.editor = null
    this.serviceMode = null
    this.formatterFactory = null
    this.ui = null

    this.tempUIDataContainer = null
  }

  appendApiAsync(structServiceProvider: StructServiceProvider) {
    this.structService = createApi(structServiceProvider, {
      'smart-layout': true,
      'ignore-stereochemistry-errors': true,
      'mass-skip-error-on-pseudoatoms': false,
      'gross-formula-add-rsites': true
    })

    if (this.tempUIDataContainer) {
      return this.appendUiAsync(
        this.tempUIDataContainer.element,
        this.tempUIDataContainer.staticResourcesUrl,
        this.tempUIDataContainer.buttons
      )
    }

    return Promise.resolve()
  }

  appendServiceMode(mode: ServiceMode) {
    this.serviceMode = mode
  }

  async appendUiAsync(
    element: HTMLDivElement | null,
    staticResourcesUrl: string,
    buttons?: ButtonsConfig
  ): Promise<void> {
    const { structService } = this

    if (!structService) {
      this.tempUIDataContainer = {
        element,
        staticResourcesUrl,
        buttons
      }

      return Promise.resolve()
    }
    this.tempUIDataContainer = null

    const tempRef: { ui: KetcherUI } = {
      ui: null as any
    }

    const editor = await new Promise<Editor>(resolve => {
      tempRef.ui = initApp(
        element,
        staticResourcesUrl,
        {
          buttons: buttons || {},
          version: process.env.VERSION || '',
          buildDate: process.env.BUILD_DATE || '',
          buildNumber: process.env.BUILD_NUMBER || ''
        },
        structService,
        resolve
      )
    })

    this.editor = editor
    this.ui = tempRef.ui
    this.formatterFactory = new FormatterFactory(
      structService,
      graphManager,
      molfileManager,
      smilesManager
    )
  }

  build() {
    if (!this.serviceMode) {
      throw new Error('You should append ServiceMode before building')
    }

    if (!this.structService) {
      throw new Error('You should append Api before building')
    }

    if (!this.editor || !this.ui) {
      throw new Error('You should append UI before building')
    }

    if (!this.formatterFactory) {
      throw new Error(
        'You should append StructureServiceFactory before building'
      )
    }

    const ketcher = new Ketcher(
      this.editor,
      this.structService,
      this.ui,
      this.formatterFactory
    )
    ketcher[this.serviceMode] = true

    // todo: remove
    ;(global as any).ketcher = ketcher
    ;(global as any)._ui_editor = this.editor

    const params = new URLSearchParams(document.location.search)
    ketcher.server.info().then(() => {
      if (params.get('moll')) {
        ketcher.ui.load(params.get('moll'))
      }
    })

    return ketcher
  }
}

export { KetcherBuilder }
