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
import { Struct } from '../entities'
import { SdfItem, SdfSerializer } from 'domain/serializers/sdf'

export interface FunctionalGroupsProvider {
  // getFunctionalGroupsList: () => Array<FunctionalGroup>
  getFunctionalGroupsList: () => Array<Struct> // TODO change to Promise
  // isFunctionalGroup: () => Promise<boolean>
}

export function prefetchStatic(url) {
  return fetch(url, { credentials: 'same-origin' }).then((resp) => {
    if (resp.ok) return resp.text()
    throw Error('Could not fetch ' + url)
  })
}

export class HttpFunctionalGroupsProvider implements FunctionalGroupsProvider {
  // eslint-disable-next-line no-use-before-define
  private static instance: HttpFunctionalGroupsProvider
  #functionalGroupsList: Array<Struct>
  #url: string
  #sdfSerializer: SdfSerializer
  #templates: Array<SdfItem>

  constructor(url) {
    this.#functionalGroupsList = []
    this.#url = url
    this.#sdfSerializer = new SdfSerializer()
    this.#templates = []
  }

  public static getInstance(url?): HttpFunctionalGroupsProvider {
    if (!HttpFunctionalGroupsProvider.instance) {
      HttpFunctionalGroupsProvider.instance = new HttpFunctionalGroupsProvider(
        url
      )
    }
    return HttpFunctionalGroupsProvider.instance
  }

  public getFunctionalGroupsList() {
    return this.#functionalGroupsList
  }

  public async setFunctionalGroupsList() {
    const text = await prefetchStatic(this.#url)
    const templates = this.#sdfSerializer.deserialize(text)

    this.#templates = templates

    const list = templates.reduce(
      (acc: Struct[], { struct }) => [...acc, struct],
      []
    )
    this.#functionalGroupsList = list
  }

  public getTemplates() {
    return this.#templates
  }

  public static isFunctionalGroup(sgroup): boolean {
    const types = this.instance.getFunctionalGroupsList()
    return (
        types.some((type) => type.name === sgroup.data.name) &&
        sgroup.type === 'SUP'
    )
  }
}

export const defaultFunctionalGroupProvider =
  HttpFunctionalGroupsProvider.getInstance(`./templates/fg.sdf`)
