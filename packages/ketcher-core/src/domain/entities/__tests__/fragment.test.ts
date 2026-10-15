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

import { Fragment } from 'domain/entities/fragment';

describe('Fragment.clone', () => {
  it('remaps stereo atom ids present in the aidMap', () => {
    const fragment = new Fragment([1, 2, 3]);
    const aidMap = new Map([
      [1, 10],
      [2, 20],
      [3, 30],
    ]);

    const cloned = fragment.clone(aidMap);

    expect(cloned.stereoAtoms).toEqual([10, 20, 30]);
  });

  it('drops stereo atom ids missing from the aidMap instead of throwing', () => {
    // Reproduces cloning a subset of a fragment (e.g. RNA Preset Wizard
    // cloning Base/Phosphate/Sugar components before the shared fragment
    // is split), where stereo atoms belonging to the sugar ring are not
    // part of the aidMap for a Base/Phosphate-only clone.
    const fragment = new Fragment([19, 21, 23]);
    const aidMap = new Map([[19, 100]]);

    const cloned = fragment.clone(aidMap);

    expect(cloned.stereoAtoms).toEqual([100]);
  });

  it('returns an empty stereoAtoms array when none of the ids are mapped', () => {
    const fragment = new Fragment([19, 21, 23]);
    const aidMap = new Map<number, number>();

    const cloned = fragment.clone(aidMap);

    expect(cloned.stereoAtoms).toEqual([]);
  });
});
