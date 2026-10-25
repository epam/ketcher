import { render, screen } from '@testing-library/react';
import FormContext from '../../../../../contexts/formContext';
import Input from '../Input/Input';
import { Field } from './form';

describe('Field', () => {
  it('does not pass extraValue to an input without an extraName', () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const stateStore = {
      field: () => ({
        dataError: undefined,
        value: 'C',
        extraValue: undefined,
        onChange: jest.fn(),
        onExtraChange: jest.fn(),
      }),
      updateState: jest.fn(),
      props: { result: {} },
    };

    render(
      <FormContext.Provider value={{ schema: {}, stateStore }}>
        <Field component={Input} name="label" />
      </FormContext.Provider>,
    );

    expect(screen.getByRole('textbox')).not.toHaveAttribute('extraValue');
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining('extraValue'),
    );
    consoleError.mockRestore();
  });
});
