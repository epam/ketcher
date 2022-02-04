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

export interface FunctionalGroupsProvider {
  // getFunctionalGroupsList: () => Array<FunctionalGroup>
  getFunctionalGroupsList: () => Promise<Array<Struct>>
  isFunctionalGroup: (sgroup: SGroup) => boolean // TODO change to Promise
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

  public get functionalGroupsList() {
    return this.#functionalGroupsList
  }

  public get functionalGroupsTemplates() {
    return this.#templates
  }

  public async getFunctionalGroupsTemplates(): Promise<Array<SdfItem>> {
    const text = await prefetchStatic(this.#url)
    return this.#sdfSerializer.deserialize(text)
  }

  public async getFunctionalGroupsList(): Promise<Array<Struct>> {
    const list = this.#templates.reduce(
      (acc: Struct[], { struct }) => [...acc, struct],
      []
    )
    return list
  }

  public async setFunctionalGroupsList() {
    this.#templates = await this.getFunctionalGroupsTemplates()
    this.#functionalGroupsList = await this.getFunctionalGroupsList()
  }

  public isFunctionalGroup(sgroup: SGroup): boolean {
    const types = this.#functionalGroupsList
    return (
      types.some((type) => type.name === sgroup.data.name) &&
      sgroup.type === 'SUP'
    )
  }

  public static isFunctionalGroup(sgroup: SGroup): boolean {
    return this.instance.isFunctionalGroup(sgroup)
  }
}

export const defaultFunctionalGroupProvider =
  HttpFunctionalGroupsProvider.getInstance(`./templates/fg.sdf`)
