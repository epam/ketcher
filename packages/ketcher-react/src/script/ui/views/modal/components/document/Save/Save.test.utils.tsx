import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { formReducer } from 'src/script/ui/state/modal/form';
import { ErrorsContext } from 'src/contexts';
import { defaultBondThickness } from 'ketcher-core';

const initialState = {
  server: true,
  options: {
    app: {
      server: true,
    },
    settings: {
      bondThickness: defaultBondThickness,
    },
    check: { checkOptions: '' },
    getServerSettings: () => ({}),
  },
  editor: {
    struct: () => ({
      hasRxnArrow: () => false,
      hasMultitailArrow: () => false,
      isBlank: () => true,
      atoms: { size: 0 },
      bonds: { size: 0 },
      rxnArrows: { size: 0 },
      frags: { values: () => [] },
    }),
    render: { options: { ignoreChiralFlag: true } },
  },
  modal: {
    form: { result: { filename: '', format: 'mol' } },
  },
};

export function renderWithMockContext(component: React.ReactNode) {
  const store = {
    ...createStore(formReducer, initialState),
    dispatch: jest.fn(),
  };
  return render(
    <Provider store={store}>
      <ErrorsContext.Provider value={{ errorHandler: jest.fn() }}>
        {component}
      </ErrorsContext.Provider>
    </Provider>,
  );
}
