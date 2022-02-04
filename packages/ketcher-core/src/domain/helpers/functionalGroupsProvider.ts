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
import { SGroup, Struct } from '../entities'
import { SdfItem, SdfSerializer } from 'domain/serializers/sdf'
import { FunctionalGroupsProvider } from 'domain/helpers/functionalGroupsProvider.types'

export function prefetchStatic(url) {
  return fetch(url, { credentials: 'same-origin' }).then((resp) => {
    if (resp.ok) return resp.text()
    throw Error('Could not fetch ' + url)
  })
}

export class HttpFunctionalGroupsProvider implements FunctionalGroupsProvider {
  #url: string
  #sdfSerializer: SdfSerializer
  #templates: Array<SdfItem> | undefined
  #functionalGroupsList: Array<Struct> | undefined

  constructor(url) {
    this.#url = url
    this.#sdfSerializer = new SdfSerializer()
    this.#templates = undefined
    this.#functionalGroupsList = undefined
  }

  public async getFunctionalGroupsTemplates() {
    if (!this.#templates) {
      const text = await prefetchStatic(this.#url)
      this.#templates = this.#sdfSerializer.deserialize(text)
    }

    return this.#templates
  }

  public async getFunctionalGroupsList(): Promise<Array<Struct>> {
    if (!this.#functionalGroupsList) {
      const templates = await this.getFunctionalGroupsTemplates()

      const list = templates.reduce(
          (acc: Struct[], { struct }) => [...acc, struct],
          []
      )
      this.#functionalGroupsList = list
    }

    return this.#functionalGroupsList
  }

  public isFunctionalGroup(sgroup: SGroup): boolean {
    if (this.#functionalGroupsList) {
      return (
          this.#functionalGroupsList.some((type) => type.name === sgroup.data.name) &&
          sgroup.type === 'SUP'
      )
    }

    return false
  }
}
