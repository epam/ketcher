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

export interface FunctionalGroupsProvider {
  // getFunctionalGroupsList: () => Array<FunctionalGroup>
  getFunctionalGroupsList: () => Array<Struct> // TODO change to Promise
  // isFunctionalGroup: () => Promise<boolean>
}

export class HttpFunctionalGroupsProvider implements FunctionalGroupsProvider {
  // eslint-disable-next-line no-use-before-define
  private static instance: HttpFunctionalGroupsProvider
  functionalGroupsList: Struct[]
  url: string

  constructor(url) {
    this.functionalGroupsList = []
    this.url = url
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
    return this.functionalGroupsList
  }

  public setFunctionalGroupsList(list: Struct[]): void {
    this.functionalGroupsList = list
  }
}

export const defaultFunctionalGroupProvider =
  HttpFunctionalGroupsProvider.getInstance(`./templates/fg.sdf`)
