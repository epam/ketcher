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
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ReStruct } from '../../render';

import { BaseOperation } from './BaseOperation';
import { StructProperty } from 'domain/entities/struct';
import { OperationType } from './OperationType';

class FragmentSetProperties extends BaseOperation {
  readonly frid: any;
  readonly properties?: Array<StructProperty>;

  constructor(fragmentId: any, properties?: Array<StructProperty>) {
    super(OperationType.FRAGMENT_SET_PROPERTIES);
    this.frid = fragmentId;
    this.properties = properties;
  }

  execute(restruct: ReStruct) {
    const struct = restruct.molecule;
    const frag = struct.frags.get(this.frid);

    if (frag) {
      if (this.properties) {
        frag.properties = this.properties;
      } else {
        delete frag?.properties;
      }
    }
  }

  invert() {
    return new FragmentSetProperties(this.frid, undefined);
  }
}

export { FragmentSetProperties };
