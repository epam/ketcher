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

import { ActionButton } from '.';

const mockClickHandler = jest.fn();
const MOCK_LABEL = 'Click Me!';

const mockProps = {
  label: MOCK_LABEL,
  clickHandler: mockClickHandler,
};

describe('ActionButton component', () => {
  it('should render button element when props are provided', () => {
    render(withThemeProvider(<ActionButton {...mockProps} />));
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should render button with specified label', () => {
    render(withThemeProvider(<ActionButton {...mockProps} />));
    expect(screen.getByRole('button')).toHaveTextContent(MOCK_LABEL);
  });

  it('should be disabled when disabled prop is true', () => {
    render(withThemeProvider(<ActionButton disabled={true} {...mockProps} />));
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should call provided callback when button is clicked', () => {
    render(withThemeProvider(<ActionButton {...mockProps} />));
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockClickHandler).toHaveBeenCalledTimes(1);
  });
});
