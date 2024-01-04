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

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { Open } from './Open';
import { IndigoProvider } from 'ketcher-react';
import { CoreEditor, Struct } from 'ketcher-core';

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.spyOn(React, 'useEffect').mockImplementation(() => {});
global.ketcher = {
  logging: jest.fn(),
};

describe('Open component', () => {
  it('should render correctly', () => {
    expect(
      render(
        withThemeAndStoreProvider(
          <Open isModalOpen={true} onClose={jest.fn()} />,
        ),
      ),
    ).toMatchSnapshot();
  });

  it('paste from clipboard', () => {
    const mockProps = {
      isModalOpen: true,
      onClose: () => expect(mockProps.onClose).toHaveBeenCalled(),
    };

    jest.spyOn(CoreEditor, 'provideEditorInstance').mockImplementation(() => {
      return {
        drawingEntitiesManager: {
          monomers: new Map(),
          polymerBonds: new Map(),
          micromoleculesHiddenEntities: new Struct(),
        },
        renderersContainer: {
          update: jest.fn(),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    });
    jest.spyOn(IndigoProvider, 'getIndigo').mockReturnValue({
      convert: () => {
        return {
          struct:
            '{"root":{"nodes":[{"$ref":"mol0"},{"$ref":"mol1"}]},"mol0":{"type":"molecule","atoms":[{"label":"C","location":[0.0,0.49999988079071047,0.0]},{"label":"C","location":[0.866025447845459,0.0,0.0]},{"label":"C","location":[1.7320506572723389,0.5,0.0]},{"label":"C","location":[2.5980758666992189,5.960464477539063e-8,0.0]},{"label":"C","location":[3.4641013145446779,0.5000001192092896,0.0]},{"label":"C","location":[4.330126762390137,1.1920928955078126e-7,0.0]},{"label":"C","location":[5.196152210235596,0.5000001192092896,0.0]},{"label":"C","location":[6.062177658081055,1.1920928955078126e-7,0.0]},{"label":"C","location":[6.9282026290893559,0.5000001192092896,0.0]},{"label":"C","location":[7.7942280769348148,1.1920928955078126e-7,0.0]}],"bonds":[{"type":1,"atoms":[0,1]},{"type":1,"atoms":[1,2]},{"type":1,"atoms":[2,3]},{"type":1,"atoms":[3,4]},{"type":1,"atoms":[4,5]},{"type":1,"atoms":[5,6]},{"type":1,"atoms":[6,7]},{"type":4,"atoms":[7,8]},{"type":1,"atoms":[8,9]}]},"mol1":{"type":"molecule","atoms":[{"label":"C","location":[10.660253524780274,0.5,0.0]},{"label":"C","location":[9.794228553771973,1.1920928955078126e-7,0.0]},{"label":"C","location":[11.52627944946289,0.0,0.0]},{"label":"C","location":[12.392304420471192,0.5000000596046448,0.0]},{"label":"C","location":[13.258330345153809,5.960464477539063e-8,0.0]},{"label":"C","location":[14.12435531616211,0.5000001192092896,0.0]},{"label":"C","location":[14.99038028717041,1.1920928955078126e-7,0.0]},{"label":"C","location":[15.856406211853028,0.5000001192092896,0.0]},{"label":"C","location":[16.722431182861329,1.1920928955078126e-7,0.0]},{"label":"C","location":[17.588457107543947,0.5000001192092896,0.0]},{"label":"C","location":[18.454483032226564,1.1920928955078126e-7,0.0]},{"label":"C","location":[19.320507049560548,0.5000001192092896,0.0]}],"bonds":[{"type":1,"atoms":[0,1]},{"type":1,"atoms":[0,2]},{"type":1,"atoms":[2,3]},{"type":1,"atoms":[3,4]},{"type":1,"atoms":[4,5]},{"type":1,"atoms":[5,6]},{"type":1,"atoms":[6,7]},{"type":1,"atoms":[7,8]},{"type":1,"atoms":[8,9]},{"type":1,"atoms":[9,10]},{"type":1,"atoms":[10,11]}]}}',
        };
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    const mockTypedText = 'CCCCC/CC/C:CC.C(C)CCCCCCCCCC';
    render(withThemeAndStoreProvider(<Open {...mockProps} />));
    const clipboardButton = screen.getByText('Paste from clipboard');
    fireEvent.click(clipboardButton);

    const clipboardTextarea = screen.getByRole('textbox');
    fireEvent.change(clipboardTextarea, { target: { value: mockTypedText } });
    expect(clipboardTextarea).toBeInTheDocument();
    expect(clipboardTextarea).toHaveValue(mockTypedText);
  });
});
