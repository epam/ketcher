import { vi } from 'vitest';
import { KetSerializer, Struct, type SdfItem } from 'ketcher-core';
import { legacy_createStore as createStore } from 'redux';
import templatesReducer, {
  addTemplate,
  deleteTmpl,
  initTmplsState,
} from './index';
import { storage } from '../../storage-ext';

describe('adding runtime templates to the library', () => {
  const template: SdfItem = {
    struct: Object.assign(new Struct(), { name: 'Cyclopropane' }),
    props: { group: 'DB Templates' },
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('adds a template to an initially empty library', () => {
    const result = templatesReducer(undefined, addTemplate(template));

    expect(result.lib).toEqual([template]);
    expect(initTmplsState.lib).toEqual([]);
    expect(result).not.toHaveProperty('template');
  });

  it('preserves existing templates, their order, and the current selection', () => {
    const existing: SdfItem = {
      struct: Object.assign(new Struct(), { name: 'Benzene' }),
      props: { group: 'User Templates' },
    };
    const store = createStore(templatesReducer);
    store.dispatch({
      type: 'TMPL_INIT',
      data: {
        lib: [existing],
        selected: existing,
        filter: 'benzene',
        group: 'User Templates',
      },
    });
    const state = store.getState();
    const lib = Object.freeze(state.lib);
    Object.freeze(state);

    store.dispatch(addTemplate(template));
    const result = store.getState();

    expect(result.lib).toEqual([existing, template]);
    expect(result.lib).not.toBe(lib);
    expect(state.lib).toEqual([existing]);
    expect(result.selected).toBe(existing);
    expect(result.filter).toBe('benzene');
    expect(result.group).toBe('User Templates');
  });

  it('keeps templates in the order in which they are added', () => {
    const second: SdfItem = {
      struct: Object.assign(new Struct(), { name: 'Cyclobutane' }),
      props: { group: 'DB Templates' },
    };
    const firstState = templatesReducer(undefined, addTemplate(template));
    const result = templatesReducer(firstState, addTemplate(second));

    expect(result.lib).toEqual([template, second]);
  });

  it('does not duplicate a runtime template when an existing library is updated', () => {
    const store = createStore(templatesReducer);
    store.dispatch(addTemplate(template));

    store.dispatch({ type: 'TMPL_INIT', data: { lib: [template] } });

    expect(store.getState().lib).toEqual([template]);
  });

  it('releases runtime templates on disposal instead of restoring them later', () => {
    const store = createStore(templatesReducer);
    store.dispatch(addTemplate(template));

    store.dispatch({ type: 'TMPL_CLEAR' });
    store.dispatch({ type: 'TMPL_INIT', data: { lib: [] } });

    expect(store.getState().lib).toEqual([]);
  });

  it('keeps runtime user templates session-only when saving library changes', () => {
    vi.spyOn(KetSerializer.prototype, 'serialize').mockImplementation(
      (struct) => struct.name,
    );
    const setItem = vi.spyOn(storage, 'setItem').mockReturnValue(true);
    const runtime: SdfItem = {
      struct: Object.assign(new Struct(), { name: 'Runtime water' }),
      props: { group: 'User Templates' },
    };
    const saved: SdfItem = {
      struct: Object.assign(new Struct(), { name: 'Saved template' }),
      props: { group: 'User Templates' },
    };
    const removed: SdfItem = {
      struct: Object.assign(new Struct(), { name: 'Deleted template' }),
      props: { group: 'User Templates' },
    };
    const getState = () => ({
      templates: {
        lib: [saved, runtime, removed],
        runtimeTemplates: [runtime],
      },
    });

    deleteTmpl(removed)(vi.fn(), getState);

    expect(setItem).toHaveBeenCalledWith('ketcher-tmpls', [
      { struct: 'Saved template', props: {} },
    ]);
  });

  it.each([undefined, {}, { template: null }])(
    'ignores an add action without a template (%p)',
    (data) => {
      expect(templatesReducer(initTmplsState, { type: 'TMPL_ADD', data })).toBe(
        initTmplsState,
      );
    },
  );
});
