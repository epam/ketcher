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
// @ts-ignore
import { StructServiceProvider } from 'ketcher-core'
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
  structServiceProvider: StructServiceProvider
  buttons?: {
    [buttonName in ButtonName]: ButtonConfig
  }
}

function buildKetcher({
  element,
  staticResourcesUrl,
  structServiceProvider,
  buttons
}: Config) {
  const params = new URLSearchParams(document.location.search)
  const ketcher = Ketcher.create(structServiceProvider.mode)

  ketcher.server = api(structServiceProvider, {
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
      ketcher.buildInfo
    ),
    ketcher.server,
    ketcher
  )

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
export default buildKetcher
