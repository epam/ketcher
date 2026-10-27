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

import { buildRnaPresetConnections, IRnaPreset } from 'ketcher-core';
import { selectFilteredPresets, selectPresetFullName } from './rnaBuilderSlice';
import { RootState } from 'state';

const presetMonomers = {
  sugar: { label: '5formD', props: { id: 'sugar-template-id' } } as never,
  base: { label: 'baA', props: { id: 'base-template-id' } } as never,
  phosphate: { label: 'cm', props: { id: 'phosphate-template-id' } } as never,
};

const buildPresetState = (
  searchFilter: string,
  presets: IRnaPreset[],
): RootState =>
  ({
    library: {
      searchFilter,
      monomers: [],
      favorites: {},
      defaultRnaPresets: [],
      selectedTabIndex: 0,
    },
    rnaBuilder: {
      presetsDefault: presets,
      presetsCustom: [],
      presetPhosphateFilter: {
        fivePrime: false,
        threePrime: false,
        noPhosphate: false,
      },
    },
  }) as RootState;

const makePreset = (
  name: string,
  overrides?: Partial<IRnaPreset>,
): IRnaPreset => ({
  name,
  nameInList: name,
  ...overrides,
});

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

describe('selectFilteredPresets — hyphen and underscore', () => {
  it.each(['-', '_'])('filters on preset name only for "%s"', (char) => {
    const presets = [
      makePreset(`name${char}match`), // name → matches
      makePreset('noMatchSugar', {
        sugar: { label: `sugar${char}only` } as never,
      }), // sugar only → no match
      makePreset('noMatchBase', {
        base: { label: `base${char}only` } as never,
      }), // base only → no match
      makePreset('noMatchPhosphate', {
        phosphate: { label: `phosphate${char}only` } as never,
      }), // phosphate only → no match
      makePreset('noMatchAlias', { aliasAxoLabs: `alias${char}only` }), // aliasAxoLabs only → no match
    ];
    expect(
      selectFilteredPresets(buildPresetState(char, presets)).map((p) => p.name),
    ).toEqual([`name${char}match`]);
  });
});
