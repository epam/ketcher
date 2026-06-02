import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { render as rtlRender } from '@testing-library/react';
import modalReducer from '../../../../state/modal';

export function renderWithMockStore(
  component,
  initialState = {
    options: {
      app: {
        errorMessage: 'Error',
      },
    },
  },
  store,
) {
  const createdStore = store || createStore(modalReducer, initialState);

  return {
    ...rtlRender(<Provider store={createdStore}>{component}</Provider>),
    store: createdStore,
  };
}
