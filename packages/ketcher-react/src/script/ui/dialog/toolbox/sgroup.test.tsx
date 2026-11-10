import {
  screen,
  fireEvent,
  within,
  render as rtlRender,
} from '@testing-library/react';
import { combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';
import { type ReactElement } from 'react';
import modalReducer from '../../state/modal';
import SGroup from './sgroup';

describe('Multiple repeating S-groups limitations should be in [1, 200]', () => {
  const setup = () => {
    const props = { type: 'MUL' };
    const utils = renderWithMockStore(<SGroup {...props} />);
    const input = screen.getByLabelText('Repeat count');
    return {
      input,
      ...utils,
    };
  };
  it('should trigger error when Repeat count > 200', () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: '201' } });
    fireEvent.mouseEnter(input);
    expect(
      screen.getByText('must be less than or equal to 200'),
    ).toBeInTheDocument();
  });

  it('should trigger error when Repeat count < 1', () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: '0' } });
    fireEvent.mouseEnter(input);
    expect(
      screen.getByText('must be greater than or equal to 1'),
    ).toBeInTheDocument();
  });

  it('should not trigger error when Repeat count = 1', () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: '1' } });
    fireEvent.mouseEnter(input);
    expect(
      screen.queryByText('must be greater than or equal to 1'),
    ).not.toBeInTheDocument();
  });

  it('should keep Repeat count empty and disable Apply when input is cleared', () => {
    const { input, store } = setup();

    fireEvent.change(input, { target: { value: '0' } });
    fireEvent.change(input, { target: { value: '' } });

    expect((input as HTMLInputElement).value).toBe('');
    expect(screen.getByTestId('OK')).toBeDisabled();
    const modalState = store?.getState?.().modal;
    expect(modalState).not.toBeNull();
    if (!modalState) {
      throw new Error('Modal state is null');
    }
    const formState = modalState.form;
    expect(formState).not.toBeNull();
    if (!formState) {
      throw new Error('Modal form state is null');
    }
    expect(formState.errors?.mul).toBeUndefined();
  });
});

describe('Copolymer S-Group type availability', () => {
  const renderAndOpenTypeSelect = (selectedSruCount: number) => {
    renderWithMockStore(
      <SGroup type="MUL" selectedSruCount={selectedSruCount} />,
    );
    const typeSelect = screen.getByRole('combobox');
    fireEvent.mouseDown(typeSelect);
  };

  it('should show Copolymer option when fewer than two SRUs are selected', () => {
    renderAndOpenTypeSelect(1);
    expect(screen.getByTestId('Copolymer-option')).toBeInTheDocument();
  });

  it('should show Copolymer option when at least two SRUs are selected', () => {
    renderAndOpenTypeSelect(2);
    expect(screen.getByTestId('Copolymer-option')).toBeInTheDocument();
  });

  it('should show Copolymer option when selected SRU count is not provided', () => {
    renderWithMockStore(<SGroup type="MUL" />);
    const typeSelect = screen.getByRole('combobox');
    fireEvent.mouseDown(typeSelect);
    expect(screen.getByTestId('Copolymer-option')).toBeInTheDocument();
  });

  it('should show Copolymer option when editing existing Copolymer S-Group', () => {
    renderWithMockStore(<SGroup type="COP" selectedSruCount={2} />, {
      modal: {
        name: '',
        prop: null,
        parentModal: null,
        form: {
          errors: {},
          result: {
            type: 'COP',
          },
        },
      },
    });
    const typeSelect = screen.getAllByRole('combobox')[0];
    fireEvent.mouseDown(typeSelect);
    expect(screen.getByTestId('Copolymer-option')).toBeInTheDocument();
  });
});

describe('Copolymer S-Group Subtype dropdown', () => {
  const openSubtypeSelect = () => {
    const { store } = renderWithMockStore(
      <SGroup type="COP" selectedSruCount={2} />,
      {
        modal: {
          name: 'SGroup',
          form: {
            errors: {},
            result: {
              type: 'COP',
              subtype: 'ran',
            },
          },
          prop: null,
          parentModal: null,
        },
      },
    );
    const subtypeSelect = within(
      screen.getByTestId('subtype-input-span'),
    ).getByRole('combobox');
    fireEvent.mouseDown(subtypeSelect);
    return { store };
  };

  it('should include a blank option alongside Random, Block and Alternating', () => {
    openSubtypeSelect();
    expect(screen.getByTestId('<Blank>-option')).toBeInTheDocument();
    expect(screen.getByTestId('Random-option')).toBeInTheDocument();
    expect(screen.getByTestId('Block-option')).toBeInTheDocument();
    expect(screen.getByTestId('Alternating-option')).toBeInTheDocument();
  });

  it('should clear a previously selected subtype when the blank option is chosen', () => {
    const { store } = openSubtypeSelect();
    fireEvent.click(screen.getByTestId('<Blank>-option'));
    expect(store.getState().modal?.form?.result?.subtype).toBeNull();
  });
});

describe('S-Group DAT type rendering', () => {
  it('should render SDataFieldset when type is DAT', () => {
    renderWithMockStore(<SGroup type="DAT" />, {
      modal: {
        name: '',
        prop: null,
        parentModal: null,
        form: {
          errors: {},
          result: {
            type: 'DAT',
            context: 'Fragment',
            fieldName: 'Field name',
            fieldValue: 'Field value',
          },
        },
      },
    });
    expect(screen.getByText('S-Group Properties')).toBeInTheDocument();
  });
});

describe('SRU S-Group defaults', () => {
  it('should prefill the Polymer label field with n when SRU is selected', () => {
    renderWithMockStore(<SGroup type="MUL" />);

    const typeSelect = screen.getByRole('combobox');
    fireEvent.mouseDown(typeSelect);
    fireEvent.click(screen.getByRole('option', { name: 'SRU polymer' }));

    expect(screen.getByLabelText('Polymer label')).toHaveValue('n');
  });
});

describe('S-Group bracket type picker', () => {
  const renderWithResult = (result: Record<string, unknown>) =>
    renderWithMockStore(<SGroup type={result.type as string} />, {
      modal: {
        name: '',
        prop: null,
        parentModal: null,
        form: { errors: {}, result },
      },
    });

  it.each([
    'MUL',
    'SRU',
    'COP',
    'SUP',
    'queryComponent',
    'nucleotideComponent',
  ])('should show the bracket type picker for %s', (type) => {
    renderWithResult({ type });

    expect(screen.getByText('Bracket type')).toBeInTheDocument();
    expect(screen.getByTestId('bracketType-input-square')).toBeInTheDocument();
    expect(screen.getByTestId('bracketType-input-round')).toBeInTheDocument();
    expect(screen.getByTestId('bracketType-input-curly')).toBeInTheDocument();
  });

  it('should select square brackets by default for a new S-group', () => {
    const { store } = renderWithResult({ type: 'MUL' });

    expect(screen.getByTestId('bracketType-input-square')).toBeChecked();
    expect(screen.getByTestId('bracketType-input-round')).not.toBeChecked();
    expect(screen.getByTestId('bracketType-input-curly')).not.toBeChecked();
    expect(store.getState().modal?.form?.result?.bracketType).toBe('square');
  });

  it('should show the bracket type of an edited S-group', () => {
    renderWithResult({ type: 'SRU', subscript: 'n', bracketType: 'curly' });

    expect(screen.getByTestId('bracketType-input-curly')).toBeChecked();
    expect(screen.getByTestId('bracketType-input-square')).not.toBeChecked();
  });

  it('should store the bracket type the user picks', () => {
    const { store } = renderWithResult({ type: 'SUP', name: 'Boc' });

    fireEvent.click(screen.getByTestId('bracketType-input-round'));

    expect(store.getState().modal?.form?.result?.bracketType).toBe('round');
  });

  it('should give the picker and its symbol-only choices accessible names', () => {
    renderWithResult({ type: 'SRU', subscript: 'n' });

    const picker = screen.getByRole('group', { name: 'Bracket type' });
    expect(
      within(picker).getByRole('radio', { name: 'Square brackets' }),
    ).toBeChecked();
    expect(
      within(picker).getByRole('radio', { name: 'Parentheses' }),
    ).not.toBeChecked();
    expect(
      within(picker).getByRole('radio', { name: 'Curly brackets' }),
    ).not.toBeChecked();
    expect(picker).toHaveTextContent('[ ]');
    expect(picker).toHaveTextContent('( )');
    expect(picker).toHaveTextContent('{ }');
  });

  it('should keep repeat-count validation when the bracket type changes', () => {
    renderWithResult({ type: 'MUL', mul: 2 });
    const count = screen.getByLabelText('Repeat count');

    fireEvent.change(count, { target: { value: '201' } });
    fireEvent.click(screen.getByTestId('bracketType-input-curly'));
    fireEvent.mouseEnter(count);

    expect(screen.getByTestId('bracketType-input-curly')).toBeChecked();
    expect(
      screen.getByText('must be less than or equal to 200'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('OK')).toBeDisabled();
  });

  it('should not show the bracket type picker for Data S-groups', () => {
    renderWithResult({
      type: 'DAT',
      context: 'Fragment',
      fieldName: 'Field name',
      fieldValue: 'Field value',
    });

    expect(screen.queryByText('Bracket type')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('bracketType-input-square'),
    ).not.toBeInTheDocument();
  });
});

const reducer = combineReducers({
  modal: modalReducer,
});

function renderWithMockStore(
  component: ReactElement,
  initialState?: Partial<ReturnType<typeof reducer>>,
) {
  const store = createStore(
    reducer,
    initialState ?? {
      modal: {
        name: '',
        prop: null,
        parentModal: null,
        form: {
          errors: {},
          result: {
            type: 'MUL',
          },
        },
      },
    },
  );
  return {
    ...rtlRender(<Provider store={store}>{component}</Provider>),
    store,
  };
}
