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

import { render, fireEvent, screen } from '@testing-library/react';
import ButtonGroup from './ToggleButtonGroup';

describe('ButtonGroup', () => {
  const buttons = [
    { label: 'Label 1', value: 1 },
    { label: 'Label 2', value: 2 },
    { label: '', value: 3 },
  ];
  const onClickMock = jest.fn();
  const defaultValue = 2;

  test('should render buttons with correct labels', () => {
    render(
      <ButtonGroup
        buttons={buttons}
        onClick={onClickMock}
        defaultValue={defaultValue}
      />,
    );

    buttons.forEach(({ label }) => {
      const buttonElement = screen.getByText(label || 'none');
      expect(buttonElement).toBeInTheDocument();
    });
  });

  test('should call onClick function when a button is clicked', () => {
    render(
      <ButtonGroup
        buttons={buttons}
        onClick={onClickMock}
        defaultValue={defaultValue}
      />,
    );

    buttons.forEach(({ value }) => {
      const buttonElement = screen.getByText(
        value !== 3 ? `Label ${value}` : 'none',
      );
      fireEvent.click(buttonElement);

      expect(onClickMock).toHaveBeenCalledWith(value);
    });
  });
});
