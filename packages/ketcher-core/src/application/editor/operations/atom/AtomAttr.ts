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

import { BaseOperation } from '../BaseOperation';
import { OperationPriority, OperationType } from '../OperationType';
import { ReStruct } from '../../../render';

type Data = {
  aid?: any;
  attribute?: any;
  value?: any;
};

type AtomListLike = {
  ids: Array<number>;
  notList: boolean;
  equals: (atomList: AtomListLike) => boolean;
};

function isAtomListLike(value: unknown): value is AtomListLike {
  const valueRecord = value as { equals?: unknown };

  return (
    typeof value === 'object' &&
    value !== null &&
    'ids' in value &&
    'notList' in value &&
    'equals' in value &&
    typeof valueRecord.equals === 'function'
  );
}

function areValuesEqual(left: unknown, right: unknown): boolean {
  if (left === right) {
    return true;
  }

  if (isAtomListLike(left) && isAtomListLike(right)) {
    return left.equals(right);
  }

  if (left === null || right === null) {
    return false;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length &&
      left.every((item, index) => areValuesEqual(item, right[index]))
    );
  }

  if (typeof left !== 'object' || typeof right !== 'object') {
    return false;
  }

  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  const leftKeys = Object.keys(leftRecord);
  const rightKeys = Object.keys(rightRecord);

  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(rightRecord, key) &&
        areValuesEqual(leftRecord[key], rightRecord[key]),
    )
  );
}

export class AtomAttr extends BaseOperation {
  data: Data | null;
  data2: Data | null;

  constructor(atomId?: any, attribute?: any, value?: any) {
    super(OperationType.ATOM_ATTR, OperationPriority.ATOM_ATTR);
    this.data = { aid: atomId, attribute, value };
    this.data2 = null;
  }

  execute(restruct: ReStruct) {
    if (this.data) {
      const { aid, attribute, value } = this.data;
      if (attribute === undefined) {
        return;
      }

      const atom = restruct.molecule.atoms.get(aid);
      if (!atom) {
        return;
      }

      if (!this.data2) {
        this.data2 = {
          aid,
          attribute,
          value: atom[attribute],
        };
      }

      atom[attribute] = value;
      BaseOperation.invalidateAtom(restruct, aid);
    }
  }

  invert() {
    const inverted = new AtomAttr();
    inverted.data = this.data2;
    inverted.data2 = this.data;
    return inverted;
  }

  isDummy(restruct?: ReStruct) {
    if (!restruct || !this.data) {
      return false;
    }

    const { aid, attribute, value } = this.data;
    if (attribute === undefined) {
      return false;
    }

    const atom = restruct.molecule.atoms.get(aid);
    if (!atom) {
      return false;
    }

    const currentValue = atom[attribute];

    if (
      currentValue !== null &&
      value !== null &&
      typeof currentValue === 'object' &&
      typeof value === 'object'
    ) {
      return areValuesEqual(currentValue, value);
    }

    return currentValue === value;
  }
}
