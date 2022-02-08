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
import { SGroup } from '../../entities'
import { SdfSerializer } from 'domain/serializers/sdf'
import { FunctionalGroupType, FunctionalGroupsProvider } from 'domain/helpers'

export function prefetch(url) {
  return fetch(url).then((resp) => {
    if (resp.ok) return resp.text()
    throw Error('Could not fetch ' + url)
  })
}

export class HttpFunctionalGroupsProvider implements FunctionalGroupsProvider {
  #url: string
  #sdfSerializer: SdfSerializer
  #functionalGroupsList: Array<FunctionalGroupType> | undefined

  constructor(url) {
    this.#url = url
    this.#sdfSerializer = new SdfSerializer()
    this.#functionalGroupsList = undefined
  }

  public async getFunctionalGroups(): Promise<Array<FunctionalGroupType>> {
    if (!this.#functionalGroupsList) {
      const text = await prefetch(this.#url)
      this.#functionalGroupsList = this.#sdfSerializer.deserialize(
        text
      ) as Array<FunctionalGroupType>
    }

    return this.#functionalGroupsList
  }

  public isFunctionalGroup(sgroup: SGroup): boolean {
    if (this.#functionalGroupsList) {
      return (
        this.#functionalGroupsList.some(
          (type) => type.struct.name === sgroup.data.name
        ) && sgroup.type === 'SUP'
      )
    }

    return false
  }
}
