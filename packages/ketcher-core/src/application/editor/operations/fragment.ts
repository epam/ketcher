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

import { ReEnhancedFlag, ReFrag, ReStruct } from '../../render';

import { BaseOperation } from './base';
import { Fragment, StructProperty } from 'domain/entities';
import { OperationType } from './OperationType';

// todo: separate classes: now here is circular dependency in `invert` method

class FragmentAdd extends BaseOperation {
  frid: any;
  properties?: Array<StructProperty>;

  constructor(fragmentId?: any, properties?: Array<StructProperty>) {
    super(OperationType.FRAGMENT_ADD);
    this.frid = typeof fragmentId === 'undefined' ? null : fragmentId;
    if (properties) {
      this.properties = properties;
    }
  }

  execute(restruct: ReStruct) {
    const struct = restruct.molecule;
    const frag = new Fragment([], null, this.properties);

    if (this.frid === null) {
      this.frid = struct.frags.add(frag);
    } else {
      struct.frags.set(this.frid, frag);
    }

    restruct.frags.set(this.frid, new ReFrag(frag)); // TODO add restruct.notifyFragmentAdded
    restruct.enhancedFlags.set(this.frid, new ReEnhancedFlag());
  }

  invert() {
    return new FragmentDelete(this.frid);
  }
}

class FragmentSetProperties extends BaseOperation {
  frid: any;
  properties?: Array<StructProperty>;

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

class FragmentDelete extends BaseOperation {
  frid: any;

  constructor(fragmentId: any) {
    super(OperationType.FRAGMENT_DELETE, 100);
    this.frid = fragmentId;
  }

  execute(restruct: ReStruct) {
    const struct = restruct.molecule;
    if (!struct.frags.get(this.frid)) {
      return;
    }

    BaseOperation.invalidateItem(restruct, 'frags', this.frid, 1);
    restruct.frags.delete(this.frid);
    struct.frags.delete(this.frid); // TODO add restruct.notifyFragmentRemoved

    const enhancedFalg = restruct.enhancedFlags.get(this.frid);
    if (!enhancedFalg) return;
    restruct.clearVisel(enhancedFalg.visel);
    restruct.enhancedFlags.delete(this.frid);
  }

  invert() {
    return new FragmentAdd(this.frid);
  }
}

export { FragmentAdd, FragmentDelete, FragmentSetProperties };
