/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import type { Struct } from 'domain/entities/struct';
import { ifDefined } from 'utilities';
import { moleculeToKet } from './moleculeToKet';

export function rgroupToKet(struct: Struct, data) {
  const body = {
    rlogic: rgroupLogicToKet(data.rgnumber, data.rgroup),
    ...moleculeToKet(struct),
  };

  return {
    ...body,
    type: 'rgroup',
  };
}

function rgroupLogicToKet(rgnumber, rglogic) {
  const result = {};

  ifDefined(result, 'number', rgnumber);
  ifDefined(result, 'range', rglogic.range, '');
  ifDefined(result, 'resth', rglogic.resth, false);
  ifDefined(result, 'ifthen', rglogic.ifthen, 0);

  return result;
}
