import { type ReactElement } from 'react';
import { legacy_createStore as createStore, type Store } from 'redux';
import { Provider } from 'react-redux';
import { render as rtlRender } from '@testing-library/react';

interface InfoModalMockState {
  options: {
    app: {
      errorMessage: string;
    };
  };
}

export function renderWithMockStore(
  component: ReactElement,
  initialState: InfoModalMockState = {
    options: {
      app: {
        errorMessage: 'Error',
      },
    },
  },
  store: Store<InfoModalMockState> = createStore(
    (state: InfoModalMockState = initialState) => state,
  ),
) {
  return {
    ...rtlRender(<Provider store={store}>{component}</Provider>),
    store,
  };
}
