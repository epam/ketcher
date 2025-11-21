import { render, fireEvent, screen } from '@testing-library/react';

import ComboBox from './combobox';

describe('ComboBox component should be rendered correctly', () => {
  it('should render combobox with suggestions', () => {
    const comboboxProps = {
      value: 'Option1',
      type: 'text',
      schema: {
        enumNames: ['Option1', 'Option2', 'Option3'],
      },
      onChange: jest.fn(),
    };

    const { asFragment } = render(<ComboBox {...comboboxProps} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('should call onChange when a suggestion is clicked', () => {
    const mockOnChange = jest.fn();
    const comboboxProps = {
      value: 'Option1',
      type: 'text',
      schema: {
        enumNames: ['Option1', 'Option2', 'Option3'],
      },
      onChange: mockOnChange,
    };

    render(<ComboBox {...comboboxProps} />);
    const input = screen.getByRole('textbox');

    // Click input to show suggestions
    fireEvent.click(input);

    // Click on a suggestion
    const suggestion = screen.getByText('Option2');
    fireEvent.mouseDown(suggestion);

    expect(mockOnChange).toHaveBeenCalledWith('Option2');
  });

  it('should hide suggestions on blur', () => {
    const comboboxProps = {
      value: 'Option1',
      schema: {
        enumNames: ['Option1', 'Option2', 'Option3'],
      },
      onChange: jest.fn(),
    };

    const { container } = render(<ComboBox {...comboboxProps} />);
    const input = screen.getByRole('textbox');

    // Click input to show suggestions
    fireEvent.click(input);

    // Verify suggestions are visible
    const suggestion = screen.getByText('Option2');
    expect(suggestion).toBeInTheDocument();

    // Blur the input
    fireEvent.blur(input);

    // Check that suggestions are hidden (component sets display: none via inline style)
    const suggestList = container.querySelector('ul');
    expect(suggestList).toHaveStyle({ display: 'none' });
  });

  it('should update input value on change', () => {
    const mockOnChange = jest.fn();
    const comboboxProps = {
      value: '',
      schema: {
        enumNames: ['Option1', 'Option2', 'Option3'],
      },
      onChange: mockOnChange,
    };

    render(<ComboBox {...comboboxProps} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;

    // Type in the input
    fireEvent.change(input, { target: { value: 'New Value' } });

    expect(mockOnChange).toHaveBeenCalledWith('New Value');
  });
});
