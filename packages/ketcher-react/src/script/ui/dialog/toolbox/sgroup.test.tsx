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

  const store = createStore(reducer, initialState);
  return {
    ...rtlRender(<Provider store={store}>{component}</Provider>),
    store,
  };
}
