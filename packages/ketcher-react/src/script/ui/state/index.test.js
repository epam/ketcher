import { vi } from 'vitest';
import { compose } from 'redux';
import { Struct } from 'ketcher-core';
import createStore, { setServer } from './index';
import { addTemplate } from './templates';

describe('state store global access', () => {
  afterEach(() => {
    delete globalThis.currentState;
    vi.unstubAllGlobals();
  });

  it('should expose the latest store state on globalThis.currentState', () => {
    const server = Promise.resolve();
    const setEditor = vi.fn();
    const store = createStore({}, server, setEditor);
    const nextServer = Promise.resolve();

    expect(globalThis.currentState).toBe(store.getState());

    store.dispatch(setServer(nextServer));

    expect(globalThis.currentState).toBe(store.getState());
    expect(globalThis.currentState.server).toBe(nextServer);
    store.dispose();
  });

  it('keeps runtime template structures out of DevTools state and action snapshots', () => {
    const devToolsCompose = vi.fn(() => compose);
    vi.stubGlobal('__REDUX_DEVTOOLS_EXTENSION_COMPOSE__', devToolsCompose);
    const store = createStore({}, Promise.resolve(), vi.fn());
    const template = {
      struct: Object.assign(new Struct(), { name: 'Runtime template' }),
      props: { group: 'DB Templates' },
    };
    const action = addTemplate(template);
    store.dispatch(action);
    const { stateSanitizer, actionSanitizer } =
      devToolsCompose.mock.calls[0][0];

    expect(stateSanitizer(store.getState()).templates).toMatchObject({
      lib: '<not serialized>',
      runtimeTemplates: '<not serialized>',
    });
    expect(actionSanitizer(action)).toEqual({
      type: 'TMPL_ADD',
      data: { template: '<not serialized>' },
    });
    expect(store.getState().templates.runtimeTemplates).toEqual([template]);
    expect(action.data.template).toBe(template);
    store.dispose();
  });
});
