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

import { BaseOperation } from '../base';
import { OperationType } from '../OperationType';
import { ReStruct } from '../../../render';

export class SGroupDataMove extends BaseOperation {
  data: {
    id: any;
    d: any;
  };

  constructor(id?: any, d?: any) {
    super(OperationType.S_GROUP_DATA_MOVE);
    this.data = { id, d };
  }

  execute(restruct: ReStruct) {
    const { d, id } = this.data;
    const { sgroups } = restruct.molecule;

    sgroups.get(id)!.pp?.add_(d); // eslint-disable-line no-underscore-dangle
    this.data.d = d.negated();

    // [MK] this currently does nothing since the DataSGroupData Visel only contains the highlighting/selection and SGroups are redrawn every time anyway
    BaseOperation.invalidateItem(restruct, 'sgroupData', id, 1);
  }

  invert() {
    const inverted = new SGroupDataMove();
    inverted.data = this.data;
    return inverted;
  }
}
