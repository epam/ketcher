import React from 'react';
import { render, screen } from '@testing-library/react';

import Input from './Input';

describe('Input component should be rendered correctly', () => {
  it('should render slider according to props', () => {
    const sliderProps = {
      name: 'Name',
      value: true,
      type: 'checkbox',
      schema: {
        title: 'Title',
        type: 'boolean',
        description: 'slider',
        default: true,
      },
      onChange: jest.fn(),
    };

    const { asFragment } = render(<Input {...sliderProps} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render checkbox if no schema provided and type is checkbox', () => {
    const checkboxProps = {
      name: 'Name',
      value: true,
      type: 'checkbox',
      onChange: jest.fn(),
    };

    const { asFragment } = render(<Input {...checkboxProps} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render textarea if no schema provided and type is textarea', () => {
    const textareaProps = {
      name: 'Name',
      value: 'value',
      type: 'textarea',
      onChange: jest.fn(),
    };

    const { asFragment } = render(<Input {...textareaProps} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('should autofocus input when autoFocus prop is true', () => {
    const inputProps = {
      name: 'test',
      value: 'test value',
      onChange: jest.fn(),
      autoFocus: true,
    };

    render(<Input {...inputProps} />);
    const input = screen.getByRole('textbox');

    expect(document.activeElement).toBe(input);
  });

  it('should allow imperative focus via ref object', () => {
    const inputProps = {
      name: 'test',
      value: 'test value',
      onChange: jest.fn(),
    };

    const ref = React.createRef<HTMLInputElement>();
    render(<Input {...inputProps} ref={ref} />);
    const input = screen.getByRole('textbox');

    // Initially not focused
    expect(document.activeElement).not.toBe(input);

    // Focus via ref
    ref.current?.focus();
    expect(document.activeElement).toBe(input);
  });

  it('should call callback ref with input element', () => {
    const inputProps = {
      name: 'test',
      value: 'test value',
      onChange: jest.fn(),
    };

    const callbackRef = jest.fn();
    render(<Input {...inputProps} ref={callbackRef} />);

    expect(callbackRef).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('should not throw when focusing via ref on unmounted component', () => {
    const inputProps = {
      name: 'test',
      value: 'test value',
      onChange: jest.fn(),
    };

    const ref = React.createRef<HTMLInputElement>();
    const { unmount } = render(<Input {...inputProps} ref={ref} />);

    unmount();

    // Should not throw when calling focus on unmounted component
    expect(() => {
      ref.current?.focus();
    }).not.toThrow();
  });

  it('should not focus when isFocused prop is provided (regression test)', () => {
    const inputProps = {
      name: 'test',
      value: 'test value',
      onChange: jest.fn(),
      isFocused: true, // This prop should be deprecated and not trigger focus
    };

    render(<Input {...inputProps} />);
    const input = screen.getByRole('textbox');

    // Should not be focused even though isFocused is true
    expect(document.activeElement).not.toBe(input);
  });

  it('should not leak isFocused prop to DOM element', () => {
    const inputProps = {
      name: 'test',
      value: 'test value',
      onChange: jest.fn(),
      isFocused: true,
    };

    render(<Input {...inputProps} />);
    const input = screen.getByRole('textbox');

    // The isFocused prop should not appear as an attribute on the DOM element
    expect(input).not.toHaveAttribute('isFocused');
    expect(input).not.toHaveAttribute('isfocused');
  });

  it('should not leak isFocused prop to DOM element when false', () => {
    const inputProps = {
      name: 'test',
      value: 'test value',
      onChange: jest.fn(),
      isFocused: false,
    };

    render(<Input {...inputProps} />);
    const input = screen.getByRole('textbox');

    // The isFocused prop should not appear as an attribute on the DOM element
    expect(input).not.toHaveAttribute('isFocused');
    expect(input).not.toHaveAttribute('isfocused');
  });
});
