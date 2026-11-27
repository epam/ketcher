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

describe('Polymer classification S-Group types', () => {
  const renderWithType = (type: string) =>
    renderWithMockStore(<SGroup type={type} selectedSruCount={2} />, {
      modal: {
        name: 'SGroup',
        form: {
          errors: {},
          result: { type },
        },
        prop: null,
        parentModal: null,
      },
    });

  it('should list Any polymer, Mer, Generic and Monomer after Copolymer', () => {
    renderWithMockStore(<SGroup type="MUL" />);
    fireEvent.mouseDown(screen.getByRole('combobox'));
    const copolymer = screen.getByTestId('Copolymer-option');
    const expectedAfterCopolymer = [
      'Any polymer-option',
      'Mer-option',
      'Generic-option',
      'Monomer-option',
    ];
    let previous = copolymer;
    for (const testId of expectedAfterCopolymer) {
      const option = screen.getByTestId(testId);
      // eslint-disable-next-line no-bitwise
      expect(
        previous.compareDocumentPosition(option) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      previous = option;
    }
  });

  it('should show Repeat Pattern and Subtype for Any polymer and Mer', () => {
    for (const type of ['ANY', 'MER']) {
      const { unmount } = renderWithType(type);
      expect(screen.getByText('Repeat Pattern')).toBeInTheDocument();
      expect(screen.getByTestId('subtype-input-span')).toBeInTheDocument();
      unmount();
    }
  });

  it('should show only Subtype for Monomer', () => {
    renderWithType('MON');
    expect(screen.getByTestId('subtype-input-span')).toBeInTheDocument();
    expect(screen.queryByText('Repeat Pattern')).not.toBeInTheDocument();
  });

  it('should show neither Repeat Pattern nor Subtype for Generic', () => {
    renderWithType('GEN');
    expect(screen.queryByText('Repeat Pattern')).not.toBeInTheDocument();
    expect(screen.queryByTestId('subtype-input-span')).not.toBeInTheDocument();
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
