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
import { MonomerItemType, IKetIdtAliases } from 'ketcher-core';
import { IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';
import { deriveRnaPresetAliasesFromDefaults } from './rnaBuilderSlice.helper';

const monomer = (id: string): MonomerItemType =>
  ({ props: { id } } as MonomerItemType);

const idtAliases = (base: string): IKetIdtAliases =>
  ({ base } as unknown as IKetIdtAliases);

const fullPreset = (overrides: Partial<IRnaPreset> = {}): IRnaPreset => ({
  sugar: monomer('sugarR'),
  base: monomer('baseA'),
  phosphate: monomer('phosphateP'),
  ...overrides,
});

const defaultPreset = fullPreset({
  idtAliases: idtAliases('A'),
  aliasAxoLabs: 'Aax',
});

describe('deriveRnaPresetAliasesFromDefaults', () => {
  it('is a no-op when the preset already has both aliases', () => {
    const preset = fullPreset({
      idtAliases: idtAliases('X'),
      aliasAxoLabs: 'Xax',
    });

    expect(deriveRnaPresetAliasesFromDefaults(preset, [defaultPreset])).toEqual(
      {},
    );
  });

  it('returns nothing when no default preset matches the components', () => {
    const preset = fullPreset({ base: monomer('baseC') });

    expect(deriveRnaPresetAliasesFromDefaults(preset, [defaultPreset])).toEqual(
      {},
    );
  });

  it('backfills only the missing alias when a default matches', () => {
    const preset = fullPreset({ aliasAxoLabs: 'existingAx' });

    expect(deriveRnaPresetAliasesFromDefaults(preset, [defaultPreset])).toEqual(
      { idtAliases: idtAliases('A') },
    );
  });

  it('backfills both aliases when the preset has none', () => {
    const preset = fullPreset();

    expect(deriveRnaPresetAliasesFromDefaults(preset, [defaultPreset])).toEqual(
      { idtAliases: idtAliases('A'), aliasAxoLabs: 'Aax' },
    );
  });

  it('does not match through empty keys when a component id is missing', () => {
    const presetMissingBase = fullPreset({ base: undefined });
    const defaultMissingBase = fullPreset({
      base: undefined,
      idtAliases: idtAliases('A'),
      aliasAxoLabs: 'Aax',
    });

    expect(
      deriveRnaPresetAliasesFromDefaults(presetMissingBase, [
        defaultMissingBase,
      ]),
    ).toEqual({});
  });
});
