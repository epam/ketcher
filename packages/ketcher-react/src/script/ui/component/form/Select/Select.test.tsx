import { vi } from 'vitest';

import { render } from '@testing-library/react';
import Select from './Select';

vi.mock('ketcher-core', () => ({
  IMAGE_KEY: 'image',
  MULTITAIL_ARROW_TOOL_NAME: 'multitail',
  CREATE_MONOMER_TOOL_NAME: 'createMonomer',
}));

const mockProps = {
  options: [
    { value: 'option1', label: 'option1' },
    { value: 'option2', label: 'option2' },
    { value: 'option3', label: 'option3' },
  ],
  onChange: vi.fn(),
};

describe('Select component should be rendered correctly', () => {
  it('should be rendered without crashing', () => {
    const { asFragment } = render(<Select {...mockProps} />);
    expect(asFragment).toMatchSnapshot();
  });
});
