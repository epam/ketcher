import { RendererProvider } from './../domain/services/renderer/rendererProvider.types'
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

import { Ketcher } from './Ketcher'
import { StructServiceProvider, RendererProvider } from 'domain/services'

export class KetcherBuilder {
  #structServiceProvider?: StructServiceProvider
  #rendererProvider?: RendererProvider

  withStructServiceProvider(
    structServiceProvider: StructServiceProvider
  ): KetcherBuilder {
    this.#structServiceProvider = structServiceProvider
    return this
  }

  withRendererProvider(rendererProvider: RendererProvider): KetcherBuilder {
    this.#rendererProvider = rendererProvider
    return this
  }

  build(): Ketcher {
    console.log(this.#structServiceProvider)
    console.log(this.#rendererProvider)
    return new Ketcher()
  }
}
