import { screen, fireEvent, render as rtlRender } from '@testing-library/react';
import { combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';
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
    expect(screen.getByText('must be <= 200')).toBeInTheDocument();
  });

  it('should trigger error when Repeat count < 1', () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: '0' } });
    fireEvent.mouseEnter(input);
    expect(screen.getByText('must be >= 1')).toBeInTheDocument();
  });

  it('should not trigger error when Repeat count = 1', () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: '1' } });
    fireEvent.mouseEnter(input);
    expect(screen.queryByText('must be >= 1')).not.toBeInTheDocument();
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

  it('should hide Copolymer option when fewer than two SRUs are selected', () => {
    renderAndOpenTypeSelect(1);
    expect(screen.queryByTestId('Copolymer-option')).not.toBeInTheDocument();
  });

  it('should show Copolymer option when at least two SRUs are selected', () => {
    renderAndOpenTypeSelect(2);
    expect(screen.getByTestId('Copolymer-option')).toBeInTheDocument();
  });
});

function renderWithMockStore(
  component,
  initialState = {
    modal: {
      form: {
        result: {
          type: 'MUL',
        },
      },
    },
  },
) {
  const reducer = combineReducers({
    modal: modalReducer,
  });

  // TODO suppressed after upgrade to react 19. Need to fix
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const store = createStore(reducer, initialState);
  return {
    ...rtlRender(<Provider store={store}>{component}</Provider>),
    store,
  };
}
