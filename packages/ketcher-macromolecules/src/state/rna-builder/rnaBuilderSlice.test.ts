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

import { buildRnaPresetConnections } from 'ketcher-core';
import { selectPresetFullName } from './rnaBuilderSlice';

const presetMonomers = {
  sugar: { label: '5formD', props: { id: 'sugar-template-id' } } as never,
  base: { label: 'baA', props: { id: 'base-template-id' } } as never,
  phosphate: { label: 'cm', props: { id: 'phosphate-template-id' } } as never,
};

describe('selectPresetFullName', () => {
  it("appends the phosphate for a preset with the phosphate on 3'", () => {
    expect(
      selectPresetFullName({
        ...presetMonomers,
        connections: buildRnaPresetConnections(presetMonomers, 'right'),
      }),
    ).toBe('5formD(baA)cm');
  });

  it("keeps the same name when the phosphate is moved to 5'", () => {
    expect(
      selectPresetFullName({
        ...presetMonomers,
        connections: buildRnaPresetConnections(presetMonomers, 'left'),
      }),
    ).toBe('5formD(baA)cm');
  });
});
