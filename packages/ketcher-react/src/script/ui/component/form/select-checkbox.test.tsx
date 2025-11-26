import { render } from '@testing-library/react';

import SelectCheckbox from './select-checkbox';

describe('SelectCheckbox component should be rendered correctly', () => {
  it('should render with boolean schema', () => {
    const booleanProps = {
      schema: {
        type: 'boolean' as const,
        title: 'Boolean Option',
        default: true,
      },
      type: 'checkbox',
      value: true,
      onChange: jest.fn(),
    };

    const { asFragment } = render(<SelectCheckbox {...booleanProps} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render with enum schema', () => {
    const enumProps = {
      schema: {
        title: 'Enum Option',
        enum: ['option1', 'option2', 'option3'],
        enumNames: ['Option 1', 'Option 2', 'Option 3'],
        default: 'option1',
      },
      type: 'radio',
      value: 'option1',
      onChange: jest.fn(),
    };

    const { asFragment } = render(<SelectCheckbox {...enumProps} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
