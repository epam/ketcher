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
  const createState = (searchFilter: string, monomers: unknown[]) =>
    ({
      library: {
        monomers,
        defaultRnaPresets: [],
        favorites: {},
        searchFilter,
        selectedTabIndex: 1,
      },
    } as Parameters<typeof selectFilteredMonomers>[0]);

  it('matches natural peptide monomers by three-letter amino acid code', () => {
    const state = createState('Trp', [
      {
        isAmbiguous: false,
        props: {
          Name: 'Natural tryptophan',
          MonomerName: 'W',
          MonomerType: 'PEPTIDE',
          MonomerNaturalAnalogCode: 'W',
        },
      },
      {
        isAmbiguous: false,
        props: {
          Name: 'Non-peptide item',
          MonomerName: 'Chem-W',
          MonomerType: 'CHEM',
          MonomerNaturalAnalogCode: 'W',
        },
      },
    ]);

    const filteredMonomers = selectFilteredMonomers(state);

    expect(filteredMonomers).toHaveLength(1);
    expect((filteredMonomers[0] as MonomerItemType).props.MonomerName).toBe(
      'W',
    );
  });
});
