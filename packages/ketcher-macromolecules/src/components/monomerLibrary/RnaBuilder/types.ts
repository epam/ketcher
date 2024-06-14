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
import { IKetIdtAliases, MonomerItemType } from 'ketcher-core';

export interface IExpandIconProps {
  expanded: boolean;
}

// TODO: Perhaps more than one interface is needed.
//  One with a minimum set of required readonly properties used by each use case,
//  and also for places of use of `favorites`, `idtAliases` and others, which reuse the first interface.
export interface IRnaPreset {
  name?: string;
  nameInList?: string;
  base?: MonomerItemType;
  sugar?: MonomerItemType;
  phosphate?: MonomerItemType;
  default?: boolean;
  favorite?: boolean;
  readonly idtAliases?: IKetIdtAliases;
  editedName?: boolean;
}
