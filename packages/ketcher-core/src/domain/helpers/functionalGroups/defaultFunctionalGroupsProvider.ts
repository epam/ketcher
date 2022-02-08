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
  FunctionalGroupType,
  FunctionalGroupsProvider,
  HttpFunctionalGroupsProvider
} from 'domain/helpers'
import { SGroup } from 'domain/entities'

export class DefaultFunctionalGroupsProvider {
  #provider: FunctionalGroupsProvider
  #functionalGroupsList: Array<FunctionalGroupType>

  constructor(provider) {
    this.#provider = provider
    this.#functionalGroupsList = []
  }

  public get functionalGroups() {
    return this.#functionalGroupsList
  }

  public isFunctionalGroup(sgroup: SGroup): boolean {
    return this.#provider.isFunctionalGroup(sgroup)
  }

  public async initFunctionalGroups(): Promise<void> {
    this.#functionalGroupsList = await this.#provider.getFunctionalGroups()
  }
}

export let functionalGroupsProvider: DefaultFunctionalGroupsProvider

export const initFunctionalGroupsProvider = async (
  provider: FunctionalGroupsProvider
): Promise<DefaultFunctionalGroupsProvider> => {
  functionalGroupsProvider = new DefaultFunctionalGroupsProvider(
    provider || HttpFunctionalGroupsProvider
  )
  await functionalGroupsProvider.initFunctionalGroups()
  return functionalGroupsProvider
}
