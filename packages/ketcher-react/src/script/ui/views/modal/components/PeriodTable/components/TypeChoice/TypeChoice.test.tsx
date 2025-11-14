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
import '@testing-library/jest-dom';
import TypeChoice from './TypeChoice';

describe('TypeChoice', () => {
  const onChangeMock = jest.fn();

  beforeEach(() => {
    onChangeMock.mockClear();
  });

  test('should render all three radio options', () => {
    render(<TypeChoice value="atom" onChange={onChangeMock} />);

    expect(screen.getByTestId('single-radio-button')).toBeInTheDocument();
    expect(screen.getByTestId('list-radio-button')).toBeInTheDocument();
    expect(screen.getByTestId('not-list-radio-button')).toBeInTheDocument();
  });

  test('should check the correct radio button based on value prop', () => {
    render(<TypeChoice value="list" onChange={onChangeMock} />);

    const singleRadio = screen.getByTestId(
      'single-radio-button',
    ) as HTMLInputElement;
    const listRadio = screen.getByTestId(
      'list-radio-button',
    ) as HTMLInputElement;
    const notListRadio = screen.getByTestId(
      'not-list-radio-button',
    ) as HTMLInputElement;

    expect(singleRadio.checked).toBe(false);
    expect(listRadio.checked).toBe(true);
    expect(notListRadio.checked).toBe(false);
  });

  test('should call onChange with correct value when radio button is clicked', () => {
    render(<TypeChoice value="atom" onChange={onChangeMock} />);

    const listRadio = screen.getByTestId('list-radio-button');
    fireEvent.click(listRadio);

    expect(onChangeMock).toHaveBeenCalledWith('list');
  });

  test('should call onChange when clicking different radio buttons', () => {
    const { rerender } = render(
      <TypeChoice value="atom" onChange={onChangeMock} />,
    );

    const listRadio = screen.getByTestId('list-radio-button');
    fireEvent.click(listRadio);
    expect(onChangeMock).toHaveBeenCalledWith('list');

    onChangeMock.mockClear();
    rerender(<TypeChoice value="list" onChange={onChangeMock} />);

    const notListRadio = screen.getByTestId('not-list-radio-button');
    fireEvent.click(notListRadio);
    expect(onChangeMock).toHaveBeenCalledWith('not-list');

    onChangeMock.mockClear();
    rerender(<TypeChoice value="not-list" onChange={onChangeMock} />);

    const singleRadio = screen.getByTestId('single-radio-button');
    fireEvent.click(singleRadio);
    expect(onChangeMock).toHaveBeenCalledWith('atom');
  });

  test('should disable all radio buttons when disabled prop is true', () => {
    render(<TypeChoice value="atom" onChange={onChangeMock} disabled />);

    const singleRadio = screen.getByTestId(
      'single-radio-button',
    ) as HTMLInputElement;
    const listRadio = screen.getByTestId(
      'list-radio-button',
    ) as HTMLInputElement;
    const notListRadio = screen.getByTestId(
      'not-list-radio-button',
    ) as HTMLInputElement;

    expect(singleRadio.disabled).toBe(true);
    expect(listRadio.disabled).toBe(true);
    expect(notListRadio.disabled).toBe(true);
  });

  test('should enable all radio buttons when disabled prop is false', () => {
    render(
      <TypeChoice value="atom" onChange={onChangeMock} disabled={false} />,
    );

    const singleRadio = screen.getByTestId(
      'single-radio-button',
    ) as HTMLInputElement;
    const listRadio = screen.getByTestId(
      'list-radio-button',
    ) as HTMLInputElement;
    const notListRadio = screen.getByTestId(
      'not-list-radio-button',
    ) as HTMLInputElement;

    expect(singleRadio.disabled).toBe(false);
    expect(listRadio.disabled).toBe(false);
    expect(notListRadio.disabled).toBe(false);
  });

  test('should render correct labels', () => {
    render(<TypeChoice value="atom" onChange={onChangeMock} />);

    expect(screen.getByText('Single')).toBeInTheDocument();
    expect(screen.getByText('List')).toBeInTheDocument();
    expect(screen.getByText('Not List')).toBeInTheDocument();
  });
});
