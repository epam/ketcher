import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MeasureInput from './measure-input';

const mockProps = {
  value: 10,
  onChange: jest.fn(),
  onExtraChange: jest.fn(),
  extraValue: 'px',
};

describe('MeasureInput component', () => {
  it('should render without crashing', () => {
    const { asFragment } = render(<MeasureInput {...mockProps} />);
    expect(asFragment).toMatchSnapshot();
  });

  it('should display the correct initial value', () => {
    render(<MeasureInput {...mockProps} />);
    const input = screen.getByDisplayValue('10');
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when value is updated', async () => {
    const onChange = jest.fn();
    render(<MeasureInput {...mockProps} onChange={onChange} />);
    const input = screen.getByDisplayValue('10');

    await userEvent.clear(input);
    await userEvent.type(input, '20');

    expect(onChange).toHaveBeenCalled();
  });

  it('should handle schema with title', () => {
    const schema = {
      title: 'Test Title',
    };
    render(<MeasureInput {...mockProps} schema={schema} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should handle schema with properties', () => {
    const schema = {
      properties: {
        testProp: {
          title: 'Property Title',
        },
      },
    };
    render(<MeasureInput {...mockProps} schema={schema} name="testProp" />);
    expect(screen.getByText('Property Title')).toBeInTheDocument();
  });
});
