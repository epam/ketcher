import { vi } from 'vitest';

import { render } from '@testing-library/react';

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
      onChange: vi.fn(),
    };

    const { asFragment } = render(<Input {...sliderProps} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render checkbox if no schema provided and type is checkbox', () => {
    const checkboxProps = {
      name: 'Name',
      value: true,
      type: 'checkbox',
      onChange: vi.fn(),
    };

    const { asFragment } = render(<Input {...checkboxProps} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render textarea if no schema provided and type is textarea', () => {
    const textareaProps = {
      name: 'Name',
      value: 'value',
      type: 'textarea',
      onChange: vi.fn(),
    };

    const { asFragment } = render(<Input {...textareaProps} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
