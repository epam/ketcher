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
/* eslint-disable @typescript-eslint/no-use-before-define */

import { BaseOperation } from '../base';
import { OperationPriority, OperationType } from '../OperationType';
import { ReStruct } from '../../../render';

// todo: separate classes: now here is circular dependency in `invert` method

type Data = {
  sgid: any;
  parent?: any;
  children?: any;
};

class SGroupAddToHierarchy extends BaseOperation {
  data: Data;

  constructor(sgroupId?: any, parent?: any, children?: any) {
    super(
      OperationType.S_GROUP_ADD_TO_HIERACHY,
      OperationPriority.S_GROUP_ADD_TO_HIERACHY,
    );
    this.data = { sgid: sgroupId, parent, children };
  }

  execute(restruct: ReStruct) {
    const { sgid, parent, children } = this.data;

    const struct = restruct.molecule;
    const sgroup = struct.sgroups.get(sgid)!;
    const relations = struct.sGroupForest.insert(sgroup, parent, children);

    this.data.parent = relations.parent;
    this.data.children = relations.children;
  }

  invert() {
    const inverted = new SGroupRemoveFromHierarchy();
    inverted.data = this.data;
    return inverted;
  }
}

class SGroupRemoveFromHierarchy extends BaseOperation {
  data: Data;

  constructor(sgroupId?: any) {
    super(OperationType.S_GROUP_REMOVE_FROM_HIERACHY, 110);
    this.data = { sgid: sgroupId };
  }

  execute(restruct: any) {
    const { sgid } = this.data;
    const struct = restruct.molecule;

    this.data.parent = struct.sGroupForest.parent.get(sgid);
    this.data.children = struct.sGroupForest.children.get(sgid);
    struct.sGroupForest.remove(sgid);
  }

  invert() {
    const inverted = new SGroupAddToHierarchy();
    inverted.data = this.data;
    return inverted;
  }
}

export { SGroupAddToHierarchy, SGroupRemoveFromHierarchy };
