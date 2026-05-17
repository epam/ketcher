import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { render as rtlRender } from '@testing-library/react';
import modalReducer from '../../../../state/modal';

/**
 * @param {any} component
 * @param {any} initialState
 * @param {any} store
 * @returns {any}
 */
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
