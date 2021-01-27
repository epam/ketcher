import { StructServiceProvider } from 'ketcher-core'
import { ServiceMode } from 'ketcher-core/src/infrastructure/services/struct/structServiceProvider.types'
import createApi, { Api } from '../../api'
import Editor from '../../editor'
import { BuildInfo, Ketcher, UI as KetcherUI } from '../../ketcher'
import { StructureServiceFactory } from '../../services/structure'
import initUI from '../../ui'
import { ButtonsConfig } from './ButtonsConfig'

class KetcherBuilder {
  private api: Api | null
  private readonly buildInfo: BuildInfo
  private editor: Editor | null
  private serviceMode: ServiceMode | null
  private structureServiceFactory: StructureServiceFactory | null
  private ui: KetcherUI | null

  private tempUIDataContainer: null | {
    element: HTMLInputElement | null
    staticResourcesUrl: string
    buttons?: ButtonsConfig
  }

  constructor() {
    this.api = null
    this.buildInfo = {
      version: process.env.VERSION || '',
      buildDate: process.env.BUILD_DATE || '',
      buildNumber: process.env.BUILD_NUMBER || ''
    }
    this.editor = null
    this.serviceMode = null
    this.structureServiceFactory = null
    this.ui = null

    this.tempUIDataContainer = null
  }

  appendApiAsync(structServiceProvider: StructServiceProvider) {
    this.api = createApi(structServiceProvider, {
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
    element: HTMLInputElement | null,
    staticResourcesUrl: string,
    buttons?: ButtonsConfig
  ): Promise<void> {
    const { api, buildInfo } = this

    if (!api) {
      this.tempUIDataContainer = {
        element,
        staticResourcesUrl,
        buttons
      }

      return Promise.resolve()
    }
    this.tempUIDataContainer = null

    const tempLink: { ui: KetcherUI } = {
      ui: null as any
    }

    const editor = await new Promise<Editor>(resolve => {
      tempLink.ui = initUI(
        element,
        staticResourcesUrl,
        Object.assign(
          {
            buttons: buttons || {}
          },
          buildInfo
        ),
        api,
        resolve
      )
    })

    this.editor = editor
    this.ui = tempLink.ui
    this.structureServiceFactory = new StructureServiceFactory(editor, api)
  }

  build() {
    if (!this.serviceMode) {
      throw new Error('You should append ServiceMode before building')
    }

    if (!this.api) {
      throw new Error('You should append Api before building')
    }

    if (!this.editor || !this.ui) {
      throw new Error('You should append UI before building')
    }

    if (!this.structureServiceFactory) {
      throw new Error(
        'You should append StructureServiceFactory before building'
      )
    }

    const ketcher = new Ketcher(
      this.editor,
      this.api,
      this.ui,
      this.buildInfo,
      this.structureServiceFactory
    )
    ketcher[this.serviceMode] = true

    // todo: remove
    ;(global as any).ketcher = ketcher
    ;(global as any)._ui_editor = this.editor

    const params = new URLSearchParams(document.location.search)
    ketcher.server.then(
      () => {
        if (params.get('moll')) {
          ketcher.ui.load(params.get('moll'))
        }
      },
      () => {
        document.title += ' (standalone)'
      }
    )

    return ketcher
  }
}

export { KetcherBuilder }
