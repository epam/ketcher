import createStore, { setServer } from './index';

describe('state store global access', () => {
  afterEach(() => {
    delete globalThis.currentState;
  });

  it('should expose the latest store state on globalThis.currentState', () => {
    const server = Promise.resolve();
    const setEditor = jest.fn();
    const store = createStore({}, server, setEditor);
    const nextServer = Promise.resolve();

    expect(globalThis.currentState).toBe(store.getState());

    store.dispatch(setServer(nextServer));

    expect(globalThis.currentState).toBe(store.getState());
    expect(globalThis.currentState.server).toBe(nextServer);
  });
});
