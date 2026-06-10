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

import { selectFilteredMonomers } from './librarySlice';
import { MonomerItemType } from 'ketcher-core';

describe('librarySlice selectors', () => {
  type TestMonomer = {
    isAmbiguous: false;
    props: Pick<
      MonomerItemType['props'],
      'Name' | 'MonomerName' | 'MonomerType' | 'MonomerNaturalAnalogCode'
    >;
  };

  const createState = (searchFilter: string, monomers: TestMonomer[]) =>
    ({
      library: {
        monomers,
        defaultRnaPresets: [],
        favorites: {},
        searchFilter,
        selectedTabIndex: 1,
      },
    } as Parameters<typeof selectFilteredMonomers>[0]);

  const createMonomer = (
    monomerName: string,
    monomerType: string,
    monomerNaturalAnalogCode: string,
  ): TestMonomer => ({
    isAmbiguous: false,
    props: {
      Name: `${monomerType}-${monomerName}`,
      MonomerName: monomerName,
      MonomerType: monomerType,
      MonomerNaturalAnalogCode: monomerNaturalAnalogCode,
    },
  });

  it('matches natural peptide monomers by three-letter amino acid code', () => {
    const state = createState('Trp', [
      createMonomer('W', 'PEPTIDE', 'W'),
      createMonomer('Chem-W', 'CHEM', 'W'),
    ]);

    const filteredMonomers = selectFilteredMonomers(state);

    expect(filteredMonomers).toHaveLength(1);
    expect((filteredMonomers[0] as MonomerItemType).props.MonomerName).toBe(
      'W',
    );
  });

  it.each(['TRP', 'Trp', 'tRp'])(
    'matches peptide monomer for case-insensitive three-letter code search (%s)',
    (searchFilter) => {
      const state = createState(searchFilter, [
        createMonomer('W', 'PEPTIDE', 'W'),
      ]);
      const filteredMonomers = selectFilteredMonomers(state);

      expect(filteredMonomers).toHaveLength(1);
      expect((filteredMonomers[0] as MonomerItemType).props.MonomerName).toBe(
        'W',
      );
    },
  );

  it.each([
    ['Asx', 'B'],
    ['Glx', 'Z'],
    ['Xaa', 'X'],
  ])(
    'matches ambiguous amino-acid code %s for natural analog %s',
    (searchFilter, naturalCode) => {
      const state = createState(searchFilter, [
        createMonomer(naturalCode, 'PEPTIDE', naturalCode),
      ]);
      const filteredMonomers = selectFilteredMonomers(state);

      expect(filteredMonomers).toHaveLength(1);
      expect((filteredMonomers[0] as MonomerItemType).props.MonomerName).toBe(
        naturalCode,
      );
    },
  );

  it('returns empty list for unknown three-letter code', () => {
    const state = createState('Abc', [createMonomer('W', 'PEPTIDE', 'W')]);

    expect(selectFilteredMonomers(state)).toHaveLength(0);
  });
});
