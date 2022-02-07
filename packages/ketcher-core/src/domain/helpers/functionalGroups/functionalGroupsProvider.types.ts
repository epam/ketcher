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

import { SGroup, Struct } from 'domain/entities'

export type FunctionalGroupType = {
  struct: Struct
  props: {
    atomid: number
    group: string
  }
}

export interface FunctionalGroupsProvider {
  getFunctionalGroupsList: () => Promise<Array<Struct>>
  isFunctionalGroup: (sgroup: SGroup) => boolean // TODO change to Promise
  getFunctionalGroupsTemplates: () => Promise<Array<FunctionalGroupType>> // TODO maybe remove this
}
