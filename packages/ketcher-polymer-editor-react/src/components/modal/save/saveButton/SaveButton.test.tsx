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

import { render, screen, fireEvent } from '@testing-library/react';

import { ChemicalMimeType } from 'helpers/formats';
import { saveAs } from 'file-saver';
import { SaveButton } from 'components/modal/save/saveButton';

jest.mock('file-saver', () => ({ saveAs: jest.fn() }));

const mockProps = {
  data: 'some test data',
  label: 'save',
  filename: 'test.mol',
  type: ChemicalMimeType.Mol,
  onSave: jest.fn(),
};

describe('save button', () => {
  it('file is downloaded after clicking save button', () => {
    render(withThemeProvider(<SaveButton {...mockProps} />));

    const button = screen.getByRole('button', { name: 'save' });
    fireEvent.click(button);

    expect(saveAs).toHaveBeenCalled();
  });
});
