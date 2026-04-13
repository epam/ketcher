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

import { FunctionalGroup, SGroup, Vec2 } from 'domain/entities';
import { ReStruct } from '../../../render';
import { BaseOperation } from '../BaseOperation';
import { OperationPriority, OperationType } from '../OperationType';
import { SGroupCreate, SGroupCreateData } from './SGroupCreate';

type Data = {
  sgid: number;
  type?: string;
  pp?: Vec2 | null;
  expanded?: boolean;
  name?: string;
  oldSgroup?: SGroup;
};

class SGroupDelete extends BaseOperation {
  data: Data;

  constructor(sgroupId?: number) {
    super(OperationType.S_GROUP_DELETE, OperationPriority.S_GROUP_DELETE);
    this.data = { sgid: sgroupId as number };
  }

  execute(restruct: ReStruct) {
    const struct = restruct.molecule;
    const { sgid } = this.data;
    const sgroup = restruct.sgroups.get(sgid);
    const sgroupData = restruct.sgroupData.get(sgid);
    if (!sgroup) return;
    this.data.type = sgroup?.item?.type;
    this.data.pp = sgroup?.item?.pp;
    this.data.oldSgroup = sgroup.item;

    if (sgroup?.item?.type === 'DAT' && sgroupData) {
      restruct.clearVisel(sgroupData.visel);
      restruct.sgroupData.delete(sgid);
    }

    restruct.clearVisel(sgroup.visel);
    if (sgroup?.item?.atoms?.length !== 0) {
      throw new Error('S-Group not empty!');
    }

    if (
      FunctionalGroup.isFunctionalGroup(sgroup.item) ||
      SGroup.isSuperAtom(sgroup.item)
    ) {
      let relatedFGroupId;
      this.data.name = sgroup.item.data.name;
      this.data.expanded = sgroup.item.isExpanded();
      restruct.molecule.functionalGroups.forEach((fg, fgid) => {
        if (fg.relatedSGroupId === sgid) {
          relatedFGroupId = fgid;
        }
      });
      restruct.molecule.functionalGroups.delete(relatedFGroupId);
    }

    restruct.sgroups.delete(sgid);
    struct.sgroups.delete(sgid);
  }

  invert() {
    const inverted = new SGroupCreate();
    inverted.data = this.data as SGroupCreateData;
    return inverted;
  }
}

export { SGroupDelete };
