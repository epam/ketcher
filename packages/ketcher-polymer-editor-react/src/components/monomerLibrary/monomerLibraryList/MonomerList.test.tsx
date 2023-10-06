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

import { render, screen } from '@testing-library/react';
import { MONOMER_TYPES } from '../../../constants';

import { MonomerList } from './MonomerList';

describe('Monomer List', () => {
  const onItemClick = jest.fn();
  const initialState = {
    library: {
      searchFilter: '',
      favorites: {},
      monomers: [
        {
          props: {
            BranchMonomer: 'false',
            MonomerCaps: '[R1]H',
            MonomerCode: '',
            MonomerName: 'Phe4SD',
            MonomerNaturalAnalogCode: 'F',
            MonomerType: 'PEPTIDE',
            Name: '(2S)-2-amino-3-{4-[(4S)-2,6-dioxo-1,3-diazinane-4-amido]phenyl}propanoic acid',
          },
          struct: {},
        },
        {
          props: {
            BranchMonomer: 'false',
            MonomerCaps: '[R1]H',
            MonomerCode: '',
            MonomerName: 'PEG2',
            MonomerNaturalAnalogCode: '.',
            MonomerType: 'CHEM',
            Name: 'Diethylene Glycol',
          },
          struct: {},
        },
      ],
    },
  };

  it('should render correct with groups', () => {
    const view = render(
      withThemeAndStoreProvider(
        <MonomerList
          libraryName={MONOMER_TYPES.PEPTIDE}
          onItemClick={onItemClick}
        />,
        initialState,
      ),
    );

    const currentItem = screen.getByText('Phe4SD');
    expect(currentItem).toBeInTheDocument();

    expect(view).toMatchSnapshot();
  });

  it('should render correct without groups', () => {
    const view = render(
      withThemeAndStoreProvider(
        <MonomerList
          libraryName={MONOMER_TYPES.CHEM}
          onItemClick={onItemClick}
        />,
        initialState,
      ),
    );

    const currentItem = screen.getByText('PEG2');
    expect(currentItem).toBeInTheDocument();

    expect(view).toMatchSnapshot();
  });
});
