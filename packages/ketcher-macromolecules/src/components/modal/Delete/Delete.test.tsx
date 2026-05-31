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

import { Delete } from './Delete';

const mockProps = {
  isModalOpen: true,
  onClose: jest.fn(),
};

describe('Delete component', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const preset: any = {
    base: {
      label: 'A',
    },
    phosphate: {
      label: 'P',
    },
    sugar: {
      label: 'R',
    },
    name: 'A',
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const presetCustom: any = {
    base: {
      label: '25A',
    },
    phosphate: {
      label: 'P',
    },
    sugar: {
      label: 'R',
    },
    name: 'MyRna',
    nameInList: 'MyRna',
  };
  it('should render correctly', () => {
    expect(
      render(
        withThemeAndStoreProvider(<Delete {...mockProps} />, {
          rnaBuilder: {
            activePresetForContextMenu: { nameInList: 'name', name: 'name' },
            presetsDefault: [preset],
            presetsCustom: [],
          },
        }),
      ),
    ).toMatchSnapshot();
  });
  it('should cancel delete', () => {
    render(
      withThemeAndStoreProvider(<Delete {...mockProps} />, {
        rnaBuilder: {
          activePresetForContextMenu: { nameInList: 'name', name: 'name' },
          presetsDefault: [preset],
          presetsCustom: [],
        },
      }),
    );
    const cancelButton = screen.getByTitle('Cancel');
    fireEvent.click(cancelButton);
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('should execute delete', () => {
    render(
      withThemeAndStoreProvider(<Delete {...mockProps} />, {
        rnaBuilder: {
          activePresetForContextMenu: { nameInList: 'name', name: 'name' },
          presetsDefault: [preset],
          presetsCustom: [presetCustom],
        },
        editor: {
          editor: {
            events: {
              selectPreset: { dispatch: () => true },
            },
          },
        },
      }),
    );
    const deleteButton = screen.getByTitle('Delete');
    fireEvent.click(deleteButton);
    expect(mockProps.onClose).toHaveBeenCalled();
  });
});
