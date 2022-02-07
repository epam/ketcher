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

import { FunctionalGroupsProvider } from 'domain/helpers/functionalGroupsProvider.types'
import { SdfItem } from 'domain/serializers'
import { SGroup, Struct } from 'domain/entities'

export class DefaultFunctionalGroupsProvider {
  // eslint-disable-next-line no-use-before-define
  private static instance: DefaultFunctionalGroupsProvider

  #provider: FunctionalGroupsProvider
  #functionalGroupsList: Array<Struct>
  #templates: Array<SdfItem>

  constructor(provider) {
    this.#provider = provider
    this.#functionalGroupsList = []
    this.#templates = []
  }

  public get functionalGroupsList() {
    return this.#functionalGroupsList
  }

  public get functionalGroupsTemplates() {
    return this.#templates
  }

  public isFunctionalGroup(sgroup: SGroup) {
    return this.#provider.isFunctionalGroup(sgroup)
  }

  public static createInstance(provider): DefaultFunctionalGroupsProvider {
    if (!this.instance) {
      this.instance = new DefaultFunctionalGroupsProvider(provider)
    }
    return this.instance
  }

  public static getInstance(): DefaultFunctionalGroupsProvider {
    return this.instance
  }

  public async initFunctionalGroups() {
    this.#templates = await this.#provider.getFunctionalGroupsTemplates()
    this.#functionalGroupsList = await this.#provider.getFunctionalGroupsList()
  }
}

export const createDefaultFunctionalGroupsProvider = async (
  provider
): Promise<DefaultFunctionalGroupsProvider> => {
  await DefaultFunctionalGroupsProvider.createInstance(
    provider
  ).initFunctionalGroups()
  return DefaultFunctionalGroupsProvider.getInstance()
}
