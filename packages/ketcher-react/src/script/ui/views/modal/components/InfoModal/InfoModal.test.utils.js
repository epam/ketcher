import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { render as rtlRender } from '@testing-library/react';
import modalReducer from 'src/script/ui/state/modal';

export function renderWithMockStore(
  component,
  initialState = {
    options: {
      app: {
        errorMessage: 'Error',
      },
    },
  },
  store = createStore(modalReducer, initialState),
) {
  return {
    ...rtlRender(<Provider store={store}>{component}</Provider>),
    store,
  };
}
