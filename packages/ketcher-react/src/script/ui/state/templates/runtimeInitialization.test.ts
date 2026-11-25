import { vi } from 'vitest';
import { applyMiddleware, legacy_createStore as createStore } from 'redux';
import { thunk } from 'redux-thunk';
import { SdfSerializer, Struct, type SdfItem } from 'ketcher-core';
import { storage } from '../../storage-ext';
import templatesReducer, { addTemplate, deleteUserTmpl } from './index';
import initTmplLib from './init-lib';

const bundledTemplates: SdfItem[] = [
  {
    struct: Object.assign(new Struct(), { name: 'Bundled' }),
    props: { group: 'Rings' },
  },
];
const runtime: SdfItem = {
  struct: Object.assign(new Struct(), { name: 'Water' }),
  props: { group: 'DB Templates' },
};

describe('runtime templates during asynchronous library initialization', () => {
  const createTemplateStore = () =>
    createStore(templatesReducer, applyMiddleware(thunk));

  beforeEach(() => {
    vi.spyOn(SdfSerializer.prototype, 'deserialize').mockReturnValue(
      bundledTemplates,
    );
    vi.spyOn(storage, 'getItem').mockReturnValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('retains a template added before initial loading finishes', async () => {
    const store = createTemplateStore();
    const loading = initTmplLib(
      store.dispatch,
      '/',
      document.createElement('div'),
    );

    store.dispatch(addTemplate(runtime));
    await loading;

    expect(store.getState().lib).toEqual([...bundledTemplates, runtime]);
  });

  it('retains runtime templates on settings reload without duplicating them', async () => {
    const store = createTemplateStore();
    store.dispatch(addTemplate(runtime));
    const cache = document.createElement('div');

    await initTmplLib(store.dispatch, '/', cache);
    await initTmplLib(store.dispatch, '/', cache);

    expect(store.getState().lib).toEqual([...bundledTemplates, runtime]);
  });

  it('does not restore a deleted runtime template after library reload', async () => {
    const store = createTemplateStore();
    store.dispatch(addTemplate(runtime));
    store.dispatch(deleteUserTmpl(runtime));

    await initTmplLib(store.dispatch, '/', document.createElement('div'));

    expect(store.getState().lib).toEqual(bundledTemplates);
  });
});
