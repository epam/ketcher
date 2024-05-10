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

import { AtomAdd, FragmentAdd } from '../operations';

import { Action } from './action';
import { Vec2 } from 'domain/entities';
import { atomGetAttr } from './utils';
import { fromBondAddition } from './bond';

export function fromChain(restruct, p0, v, nSect, atomId) {
  // eslint-disable-line max-params
  const dx = Math.cos(Math.PI / 6);
  const dy = Math.sin(Math.PI / 6);

  let action = new Action();

  const frid =
    atomId !== null
      ? atomGetAttr(restruct, atomId, 'fragment')
      : (action.addOp(new FragmentAdd().perform(restruct)) as FragmentAdd).frid;

  const chainItems: any = {
    atoms: [],
    bonds: [],
  };

  let id0 =
    atomId !== null
      ? atomId
      : (
          action.addOp(
            new AtomAdd({ label: 'C', fragment: frid }, p0).perform(restruct),
          ) as AtomAdd
        ).data.aid;

  chainItems.atoms.push(id0);
  action.operations.reverse();

  for (let i = 0; i < nSect; i++) {
    const pos = new Vec2(dx * (i + 1), i & 1 ? 0 : dy).rotate(v).add(p0);

    const ret = fromBondAddition(
      restruct,
      {},
      id0,
      { label: 'C' },
      undefined,
      pos,
    );
    action = ret[0].mergeWith(action);
    id0 = ret[2];
    chainItems.bonds.push(ret[3]);
    chainItems.atoms.push(id0);
  }

  return [action, chainItems];
}
