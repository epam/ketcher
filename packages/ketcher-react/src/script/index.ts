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
import { StructServiceProvider } from 'ketcher-core'
import { KetcherBuilder, ButtonsConfig } from './builders'

interface Config {
  element: HTMLDivElement | null
  staticResourcesUrl: string
  structServiceProvider: StructServiceProvider
  buttons?: ButtonsConfig
}

async function buildKetcherAsync({
  element,
  staticResourcesUrl,
  structServiceProvider,
  buttons
}: Config) {
  const builder = new KetcherBuilder()

  await builder.appendApiAsync(structServiceProvider)
  builder.appendServiceMode(structServiceProvider.mode)
  await builder.appendUiAsync(element, staticResourcesUrl, buttons)

  return builder.build()
}

export type { Config, ButtonsConfig }
export default buildKetcherAsync
