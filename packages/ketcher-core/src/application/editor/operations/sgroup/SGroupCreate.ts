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

import { BaseMonomer, FunctionalGroup, SGroup, Vec2 } from 'domain/entities';
import { ReSGroup, ReStruct } from '../../../render';
import { BaseOperation } from '../BaseOperation';
import { OperationType } from '../OperationType';
import { MonomerMicromolecule } from 'domain/entities/monomerMicromolecule';
import { SGroupDelete } from './SGroupDelete';

export type SGroupCreateData = {
  sgid: number;
  type?: string;
  pp?: Vec2 | null;
  expanded?: boolean;
  name?: string;
  oldSgroup?: SGroup;
};

const SGROUP_TYPE_MAPPING: Record<string, string> = {
  nucleotideComponent: SGroup.TYPES.SUP,
};

class SGroupCreate extends BaseOperation {
  data: SGroupCreateData;

  constructor(
    sgroupId?: number,
    type?: string,
    pp?: Vec2 | null,
    expanded?: boolean,
    name?: string,
    oldSgroup?: SGroup,
    private readonly monomer?: BaseMonomer,
  ) {
    super(OperationType.S_GROUP_CREATE);
    this.data = {
      sgid: sgroupId as number,
      type,
      pp,
      expanded,
      name,
      oldSgroup,
    };
  }

  execute(restruct: ReStruct) {
    const struct = restruct.molecule;
    const { sgid, pp, expanded, name, oldSgroup } = this.data;
    let sgroup: SGroup;

    if (oldSgroup && oldSgroup instanceof MonomerMicromolecule) {
      sgroup = new MonomerMicromolecule(SGroup.TYPES.SUP, oldSgroup.monomer);
    } else if (this.monomer) {
      sgroup = new MonomerMicromolecule(SGroup.TYPES.SUP, this.monomer);
    } else {
      sgroup = new SGroup(
        (this.data.type && SGROUP_TYPE_MAPPING[this.data.type]) ||
          (this.data.type as string),
      );
    }

    sgroup.id = sgid;
    struct.sgroups.set(sgid, sgroup);

    if (pp) {
      sgroup.pp = new Vec2(pp);
    }

    if (expanded) {
      sgroup.data.expanded = expanded;
      if (sgroup instanceof MonomerMicromolecule) {
        if (Object.isFrozen(sgroup.monomer.monomerItem)) {
          sgroup.monomer.monomerItem = { ...sgroup.monomer.monomerItem };
        }
        sgroup.monomer.monomerItem.expanded = expanded;
      }
    }

    if (name) {
      sgroup.data.name = name;
    }

    const existingSGroup = struct.sgroups.get(sgid);

    if (existingSGroup) {
      restruct.sgroups.set(sgid, new ReSGroup(existingSGroup));
      if (
        FunctionalGroup.isFunctionalGroup(sgroup) ||
        SGroup.isSuperAtom(sgroup)
      ) {
        restruct.molecule.functionalGroups.add(new FunctionalGroup(sgroup));
      }
    }
    this.data.sgid = sgid;
  }

  invert() {
    const inverted = new SGroupDelete();
    inverted.data = this.data;
    return inverted;
  }
}

export { SGroupCreate };
