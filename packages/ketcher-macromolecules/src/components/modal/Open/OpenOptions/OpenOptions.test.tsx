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

import { OpenOptions } from './OpenOptions';

const mockProps = {
  selectClipboard: jest.fn(),
  fileLoadHandler: jest.fn(),
  errorHandler: jest.fn(),
};

describe('OpenOptions component', () => {
  it('should render correctly', () => {
    expect(
      render(withThemeProvider(<OpenOptions {...mockProps} />)),
    ).toMatchSnapshot();
  });
  it('should render correctly with passed props', () => {
    render(withThemeProvider(<OpenOptions {...mockProps} />));

    expect(screen.getByText('Paste from clipboard')).toBeInTheDocument();
    expect(screen.getByText('Open from file')).toBeInTheDocument();
  });
  it('callback for Paste from clipboard button should be called after click', () => {
    render(withThemeProvider(<OpenOptions {...mockProps} />));
    const button = screen.getByText('Paste from clipboard');

    fireEvent.click(button);

    expect(mockProps.selectClipboard).toBeCalled();
  });
});
