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

import { ButtonsConfig, KetcherBuilder } from './builders'
import { storage as defaultStorage } from '../script/ui/storage-ext'

import { StructServiceProvider, StorageProvider } from 'ketcher-core'

interface Config {
  element: HTMLDivElement | null
  staticResourcesUrl: string
  structServiceProvider: StructServiceProvider
  buttons?: ButtonsConfig
  errorHandler: (message: string) => void
  storage?: StorageProvider
}

async function buildKetcherAsync({
  element,
  staticResourcesUrl,
  structServiceProvider,
  buttons,
  errorHandler,
  storage
}: Config) {
  const builder = new KetcherBuilder()
  builder.appendStorage(storage || defaultStorage)
  await builder.appendApiAsync(structServiceProvider)
  builder.appendServiceMode(structServiceProvider.mode)
  await builder.appendUiAsync(
    element,
    staticResourcesUrl,
    errorHandler,
    buttons,
    builder.getStorage()
  )

  return builder.build()
}

export type { Config, ButtonsConfig }
export default buildKetcherAsync
