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

describe('Mixture S-Group type', () => {
  const selectMixture = () => {
    const utils = renderWithMockStore(<SGroup type="MUL" />);
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Mixture' }));
    return utils;
  };

  const openSubtypeSelect = () => {
    fireEvent.mouseDown(
      within(screen.getByTestId('mixtureType-input-span')).getByRole(
        'combobox',
      ),
    );
  };

  it('should list Mixture directly after Superatom', () => {
    renderWithMockStore(<SGroup type="MUL" />);
    fireEvent.mouseDown(screen.getByRole('combobox'));

    const options = screen
      .getAllByRole('option')
      .map((option) => option.textContent);

    expect(options).toEqual([
      'Data',
      'Multiple group',
      'SRU polymer',
      'Copolymer',
      'Superatom',
      'Mixture',
      'Query component',
      'Nucleotide Component',
    ]);
  });

  it('should offer Ordered and Unordered with neither selected', () => {
    const { store } = selectMixture();

    expect(store.getState().modal?.form?.result?.mixtureType).toBeUndefined();

    openSubtypeSelect();
    expect(
      screen.getAllByRole('option').map((option) => option.textContent),
    ).toEqual(['Ordered', 'Unordered']);
  });

  it('should disable Apply until a subtype is selected', () => {
    selectMixture();
    expect(screen.getByTestId('OK')).toBeDisabled();

    openSubtypeSelect();
    fireEvent.click(screen.getByRole('option', { name: 'Unordered' }));

    expect(screen.getByTestId('OK')).toBeEnabled();
  });

  it('should store the S-group type of the selected subtype', () => {
    const { store } = selectMixture();

    openSubtypeSelect();
    fireEvent.click(screen.getByRole('option', { name: 'Ordered' }));

    expect(store.getState().modal?.form?.result).toMatchObject({
      type: 'mixture',
      mixtureType: 'FOR',
    });
  });

  it('should show the subtype of an existing mixture and allow Apply', () => {
    renderWithMockStore(<SGroup type="mixture" mixtureType="FOR" />, {
      modal: {
        name: '',
        prop: null,
        parentModal: null,
        form: {
          errors: {},
          result: { type: 'mixture', mixtureType: 'FOR' },
        },
      },
    });

    expect(
      within(screen.getByTestId('mixtureType-input-span')).getByRole(
        'combobox',
      ),
    ).toHaveTextContent('Ordered');
    expect(screen.getByTestId('OK')).toBeEnabled();
  });

  it('should not carry the mixture subtype over to a copolymer', () => {
    const { store } = selectMixture();
    openSubtypeSelect();
    fireEvent.click(screen.getByRole('option', { name: 'Unordered' }));

    fireEvent.mouseDown(screen.getAllByRole('combobox')[0]);
    fireEvent.click(screen.getByRole('option', { name: 'Copolymer' }));

    const result = store.getState().modal?.form?.result;
    expect(result).toMatchObject({ type: 'COP' });
    expect(result).not.toHaveProperty('mixtureType');
    expect(result?.subtype ?? null).toBeNull();
    expect(screen.getByTestId('OK')).toBeEnabled();
  });

  it('should not carry the copolymer subtype over to a mixture', () => {
    const { store } = renderWithMockStore(<SGroup type="COP" />, {
      modal: {
        name: '',
        prop: null,
        parentModal: null,
        form: {
          errors: {},
          result: { type: 'COP', subtype: 'ran', connectivity: 'ht' },
        },
      },
    });

    fireEvent.mouseDown(screen.getAllByRole('combobox')[0]);
    fireEvent.click(screen.getByRole('option', { name: 'Mixture' }));

    const result = store.getState().modal?.form?.result;
    expect(result).toMatchObject({ type: 'mixture' });
    expect(result).not.toHaveProperty('subtype');
    expect(screen.getByTestId('OK')).toBeDisabled();
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
