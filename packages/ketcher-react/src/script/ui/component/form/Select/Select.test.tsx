import { render } from '@testing-library/react';

jest.mock(
  'ketcher-core',
  () => ({
    IMAGE_KEY: 'image',
    MULTITAIL_ARROW_TOOL_NAME: 'multitail',
    CREATE_MONOMER_TOOL_NAME: 'createMonomer',
  }),
  { virtual: true },
);

import Select from './Select';

const mockProps = {
  options: [
    { value: 'option1', label: 'option1' },
    { value: 'option2', label: 'option2' },
    { value: 'option3', label: 'option3' },
  ],
  onChange: jest.fn(),
};

describe('Select component should be rendered correctly', () => {
  it('should be rendered without crashing', () => {
    const { asFragment } = render(<Select {...mockProps} />);
    expect(asFragment).toMatchSnapshot();
  });

  it('should display label for empty value option', () => {
    const options = [
      { value: '', label: 'Not Specified' },
      ...mockProps.options,
    ];
    const { getByText } = render(
      <Select {...mockProps} options={options} value="" />,
    );

    expect(getByText('Not Specified')).toBeInTheDocument();
  });
});
