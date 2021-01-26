/****************************************************************************
 * Copyright 2018 EPAM Systems
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
import { StructServiceProvider } from 'ketcher-core'
import createApi from './api'
import Editor from './editor'
import { BuildInfo, Ketcher, UI as KetcherUI } from './ketcher'
import { ServerStructureService } from './services'
import initUI from './ui'

interface ButtonConfig {
  name: string
  hidden?: boolean
}

type ButtonName =
  | 'layout'
  | 'clean'
  | 'arom'
  | 'dearom'
  | 'cip'
  | 'check'
  | 'analyse'
  | 'recognize'
  | 'miew'

interface Config {
  element: HTMLInputElement | null
  staticResourcesUrl: string
  structServiceProvider: StructServiceProvider
  buttons?: {
    [buttonName in ButtonName]: ButtonConfig
  }
}

async function buildKetcherAsync({
  element,
  staticResourcesUrl,
  structServiceProvider,
  buttons
}: Config) {
  const ketcherApi = createApi(structServiceProvider, {
    'smart-layout': true,
    'ignore-stereochemistry-errors': true,
    'mass-skip-error-on-pseudoatoms': false,
    'gross-formula-add-rsites': true
  })

  const buildInfo: BuildInfo = {
    version: process.env.VERSION as string,
    buildDate: process.env.BUILD_DATE as string,
    buildNumber: process.env.BUILD_NUMBER as string
  }

  const [ui, editor] = await new Promise<[KetcherUI, Editor]>(resolve => {
    const setEditor = editor => {
      resolve([ui, editor])
    }

    const ui = initUI(
      element,
      staticResourcesUrl,
      Object.assign(
        {
          buttons: buttons || {}
        },
        buildInfo
      ),
      ketcherApi,
      setEditor
    )
  })

  const structureService = new ServerStructureService(editor, ketcherApi)
  const ketcher = Ketcher.create(
    structServiceProvider.mode,
    editor,
    ketcherApi,
    ui,
    buildInfo,
    structureService
  )

  const params = new URLSearchParams(document.location.search)
  ketcher.server.then(
    () => {
      if (params.get('moll')) ketcher.ui.load(params.get('moll'))
    },
    () => {
      document.title += ' (standalone)'
    }
  )

  return ketcher
}

export type { Config }
export default buildKetcherAsync
