import { vi } from 'vitest';
import { isValidElement } from 'react';
import type { Root } from 'react-dom/client';
import { Struct } from 'ketcher-core';
import type { Api } from 'src/script/api';
import type { AppStore } from '../state';
import { initApp } from './initApp';

vi.mock('./App.container', () => ({ default: () => null }));
vi.mock('../state/hotkeys', () => ({
  initKeydownListener: () => ({ type: 'KEYDOWN_INIT' }),
  removeKeydownListener: () => ({ type: 'KEYDOWN_REMOVE' }),
}));
vi.mock('../state/mouse', () => ({
  initMouseListener: () => ({ type: 'MOUSE_INIT' }),
  removeMouseListeners: () => ({ type: 'MOUSE_REMOVE' }),
}));
vi.mock('../state/toolbar', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../state/toolbar')>()),
  initResize: () => ({ type: 'RESIZE_INIT' }),
  removeResizeListener: vi.fn(),
}));

describe('template events across editor cleanup', () => {
  const cleanups: Array<() => void> = [];
  const startEditor = () => {
    const render = vi.fn<Root['render']>();
    const cleanup = initApp(
      '',
      'template-cleanup-test',
      document.createElement('div'),
      { render, unmount: vi.fn() },
      '/',
      {
        buttons: {},
        errorHandler: null,
        version: '',
        buildDate: '',
        buildNumber: '',
        customButtons: [],
      },
      {} as Api,
      vi.fn(),
    );
    cleanups.push(cleanup);
    const root = render.mock.calls[0]?.[0];
    if (!isValidElement<{ store: AppStore }>(root)) {
      throw new Error('initApp did not render a Redux provider');
    }
    return { cleanup, store: root.props.store };
  };
  const publish = (name: string) => {
    const struct = new Struct();
    struct.name = name;
    window.dispatchEvent(
      new CustomEvent('KETCHER_ADD_TEMPLATE', {
        detail: {
          struct,
          props: { group: 'DB Templates' },
        },
      }),
    );
  };

  afterEach(() => {
    cleanups.splice(0).forEach((cleanup) => cleanup());
  });

  it('stops updating a cleaned-up editor while the active editor still receives templates', () => {
    const first = startEditor();
    const second = startEditor();
    publish('First');
    expect(first.store.getState().templates.lib).toHaveLength(1);

    first.cleanup();
    const previous = first.store.getState().templates.lib;
    publish('Second');

    expect(first.store.getState().templates.lib).toBe(previous);
    expect(second.store.getState().templates.lib).toHaveLength(2);
  });

  it('supports repeated cleanup without retaining the template event handler', () => {
    const { cleanup, store } = startEditor();
    cleanup();
    cleanup();
    const previous = store.getState().templates.lib;

    publish('After cleanup');

    expect(store.getState().templates.lib).toBe(previous);
  });
});
