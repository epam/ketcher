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
import { StructServiceProvider } from '../infrastructure/services'
import api from './api'
import initUI from './ui'
import { Ketcher } from './ketcher'

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
  apiPath?: string
  structServiceProvider: StructServiceProvider
  buttons?: {
    [buttonName in ButtonName]: ButtonConfig
  }
}

// TODO: replace window.onload with something like <https://github.com/ded/domready>
// to start early
function buildKetcher({
  element,
  staticResourcesUrl,
  apiPath,
  structServiceProvider,
  buttons
}: Config) {
  const ketcher = new Ketcher()
  ketcher.apiPath = apiPath

  const params = new URLSearchParams(document.location.search)

  if (params.has('api_path')) ketcher.apiPath = params.get('api_path')

  ketcher.server = api(ketcher.apiPath, structServiceProvider, {
    'smart-layout': true,
    'ignore-stereochemistry-errors': true,
    'mass-skip-error-on-pseudoatoms': false,
    'gross-formula-add-rsites': true
  })

  ketcher.ui = initUI(
    element,
    staticResourcesUrl,
    Object.assign(
      {
        buttons: buttons || {}
      },
      params,
      ketcher.buildInfo
    ),
    ketcher.server
  )

  ketcher.server.then(
    () => {
      if (params.get('moll')) ketcher.ui.load(params.get('moll'))
    },
    () => {
      document.title += ' (standalone)'
    }
  )

  // todo: remove this and refactor ketcher using of
  ;(global as any).ketcher = ketcher
  ;(global as any).ketcher[structServiceProvider.mode] = true

  return ketcher
}

export type { Config }
export default buildKetcher
