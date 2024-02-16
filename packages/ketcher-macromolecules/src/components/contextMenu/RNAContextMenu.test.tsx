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

import { fireEvent, render, screen } from '@testing-library/react';
import { ModalContainer } from 'components/modal/modalContainer';
import { RnaBuilder } from 'components/monomerLibrary/RnaBuilder';
import { MONOMER_TYPES } from 'src/constants';
import { EditorClassName } from 'ketcher-react';
import mockedPresets from './mockedPresets.json';

jest.mock('../../../src/helpers/dom.ts', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    scrollToElement: () => {},
  };
});
const monomerData = [
  {
    struct: {},
    props: {
      Name: 'Ribose',
      MonomerType: 'RNA',
      MonomerName: 'R',
      MonomerCode: 'R',
      MonomerNaturalAnalogCode: 'R',
      BranchMonomer: 'false',
      MonomerCaps: { R1: 'H' },
    },
  },
  {
    struct: {},
    props: {
      Name: 'Phosphate',
      MonomerType: 'RNA',
      MonomerName: 'P',
      MonomerCode: 'P',
      MonomerNaturalAnalogCode: 'P',
      BranchMonomer: 'false',
      MonomerCaps: { R1: 'O' },
    },
  },
  {
    props: {
      Name: 'Adenine',
      MonomerType: 'RNA',
      MonomerName: 'A',
      MonomerCode: 'A',
      MonomerNaturalAnalogCode: 'A',
      BranchMonomer: 'true',
      MonomerCaps: { R1: 'H' },
    },
  },
];
describe('RNA ContextMenu', () => {
  const editPreset = jest.fn();
  const duplicatePreset = jest.fn();

  it('should render contextMenu correctly', () => {
    render(
      withThemeAndStoreProvider(
        <div className={EditorClassName}>
          <RnaBuilder
            libraryName={MONOMER_TYPES.RNA}
            duplicatePreset={duplicatePreset}
            editPreset={editPreset}
          />
        </div>,
        {
          library: {
            searchFilter: '',
            favorites: {},
            monomers: monomerData,
          },
          rnaBuilder: {
            presets: mockedPresets,
          },
        },
      ),
    );
    const presetCard = screen.getByTestId('A_A_R_P');
    fireEvent.contextMenu(presetCard);
    expect(screen.getByTestId('deletepreset')).toBeInTheDocument();
  });

  it("should disable 'Delete Preset' menu when trying to delete default preset", () => {
    render(
      withThemeAndStoreProvider(
        <div className={EditorClassName}>
          <RnaBuilder
            libraryName={MONOMER_TYPES.RNA}
            duplicatePreset={duplicatePreset}
            editPreset={editPreset}
          />
        </div>,
        {
          library: {
            searchFilter: '',
            favorites: {},
            monomers: monomerData,
          },
          rnaBuilder: {
            presets: mockedPresets,
          },
        },
      ),
    );
    const preset = screen.getByTestId('A_A_R_P');
    fireEvent.contextMenu(preset);
    const deleteMenu = screen.getByTestId('deletepreset');
    expect(deleteMenu.className).toContain('disabled');
  });

  it("should enable 'Delete Preset' when trying to delete non-default preset", () => {
    render(
      withThemeAndStoreProvider(
        <div className={EditorClassName}>
          <RnaBuilder
            libraryName={MONOMER_TYPES.RNA}
            duplicatePreset={duplicatePreset}
            editPreset={editPreset}
          />
          <ModalContainer />
        </div>,
        {
          library: {
            searchFilter: '',
            favorites: {},
            monomers: monomerData,
          },
          rnaBuilder: {
            presets: mockedPresets,
          },
        },
      ),
    );
    const preset = screen.getByTestId('A_A_R_P');
    fireEvent.contextMenu(preset);
    const deleteMenu = screen.getByTestId('deletepreset');
    expect(deleteMenu.className).toContain('disabled');
  });
});
