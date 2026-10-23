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
import { FileControls } from './FileControls';

describe('FileControls', () => {
  const defaultProps = {
    onFileOpen: jest.fn(),
    onSave: jest.fn(),
    shortcuts: {},
    hiddenButtons: [],
  };

  it('renders Open and Save enabled by default', () => {
    render(<FileControls {...defaultProps} disabledButtons={[]} />);

    expect(screen.getByTestId('open-file-button')).toBeEnabled();
    expect(screen.getByTestId('save-file-button')).toBeEnabled();
  });

  // The Open/Save actions are flagged disabled while the monomer creation
  // wizard is active (see action config). This guards the wiring that forwards
  // that state to the buttons. Issue: epam/ketcher#10196
  it('disables Open and Save when they are in disabledButtons', () => {
    render(
      <FileControls {...defaultProps} disabledButtons={['open', 'save']} />,
    );

    expect(screen.getByTestId('open-file-button')).toBeDisabled();
    expect(screen.getByTestId('save-file-button')).toBeDisabled();
  });
});
