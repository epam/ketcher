import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { contextMenu, Item } from 'react-contexify';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import ContextMenu from './ContextMenu';
import { CONTEXT_MENU_ID } from './contextMenu.types';

const { editor } = vi.hoisted(() => ({
  editor: {
    contextMenu: {} as Record<string, boolean>,
    hoverIcon: { hide: vi.fn() },
  },
}));

vi.mock('src/hooks', () => ({
  useAppContext: () => ({ ketcherId: 'test' }),
}));
vi.mock('ketcher-core', async () => ({
  ...(await vi.importActual<typeof import('ketcher-core')>('ketcher-core')),
  ketcherProvider: {
    getKetcher: () => ({ editor }),
    getIndexById: () => 0,
  },
}));
vi.mock('./menuItems/FunctionalGroupMenuItems', () => ({
  default: () => <Item>Expand</Item>,
}));
vi.mock('./menuItems/AtomMenuItems', () => ({ default: () => null }));
vi.mock('./menuItems/BondMenuItems', () => ({ default: () => null }));
vi.mock('./menuItems/SelectionMenuItems', () => ({ default: () => null }));
vi.mock('./menuItems/RGroupAttachmentPointMenuItems', () => ({
  default: () => null,
}));
vi.mock('./menuItems/MultitailArrowMenuItems', () => ({
  MultitailArrowMenuItems: () => null,
}));
vi.mock('./menuItems/MacromoleculeMenuItems', () => ({ default: () => null }));
vi.mock('./menuItems/AttachmentPointLabelMenuItems', () => ({
  default: () => null,
}));
vi.mock('./menuItems/AttachmentGroupMenuItems', () => ({
  default: () => null,
}));

describe('context menu focus', () => {
  let root: HTMLDivElement;
  let cliparea: HTMLTextAreaElement;
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    root = document.createElement('div');
    root.className = 'Ketcher-root';
    root.dataset.ketcherId = 'test';
    cliparea = document.createElement('textarea');
    cliparea.className = 'cliparea';
    root.appendChild(cliparea);
    document.body.appendChild(root);
    store = createStore((state = { modal: null }, action) =>
      action.type === 'OPEN_MODAL' ? { modal: {} } : state,
    );
    render(
      <Provider store={store}>
        <ContextMenu />
      </Provider>,
      { container: root.appendChild(document.createElement('div')) },
    );
    cliparea.focus();
  });

  afterEach(() => {
    root.remove();
    editor.contextMenu = {};
  });

  async function openMenu() {
    act(() => {
      contextMenu.show({
        id: CONTEXT_MENU_ID.FOR_FUNCTIONAL_GROUPS + 'test',
        event: new MouseEvent('contextmenu', { bubbles: true }),
      });
    });
    return await screen.findByRole('menuitem', { name: 'Expand' });
  }

  async function waitForMenuToClose() {
    await waitFor(() =>
      expect(
        editor.contextMenu[CONTEXT_MENU_ID.FOR_FUNCTIONAL_GROUPS + 'test'],
      ).toBe(false),
    );
  }

  it('restores editor focus after selecting a menu item', async () => {
    const item = await openMenu();
    fireEvent.click(item);
    fireEvent.animationEnd(item);

    await waitFor(() => expect(cliparea).toHaveFocus());
  });

  it('restores focus when the close notification precedes menu removal', async () => {
    const item = await openMenu();
    item.focus();
    vi.useFakeTimers();
    try {
      act(() => {
        contextMenu.hideAll();
        vi.runOnlyPendingTimers();
      });
      expect(cliparea).toHaveFocus();
    } finally {
      vi.useRealTimers();
    }
  });

  it('restores editor focus when a focused menu is dismissed with Escape', async () => {
    const item = await openMenu();
    item.focus();
    fireEvent.keyDown(item, { key: 'Escape' });

    await waitForMenuToClose();
    expect(cliparea).toHaveFocus();
  });

  it('does not steal focus from an input selected outside the menu', async () => {
    const item = await openMenu();
    item.focus();
    const input = document.createElement('input');
    document.body.appendChild(input);
    fireEvent.mouseDown(input);
    input.focus();
    fireEvent.click(input);

    await waitForMenuToClose();
    expect(input).toHaveFocus();
    input.remove();
  });

  it('does not restore focus when a menu action opens a dialog', async () => {
    const item = await openMenu();
    fireEvent.click(item);
    act(() => {
      store.dispatch({ type: 'OPEN_MODAL' });
    });
    fireEvent.animationEnd(item);

    await waitForMenuToClose();
    expect(document.body).toHaveFocus();
  });

  it('does not restore focus after a click outside the editor', async () => {
    const item = await openMenu();
    item.focus();
    fireEvent.mouseDown(document.body);
    fireEvent.click(document.body);

    await waitForMenuToClose();
    expect(document.body).toHaveFocus();
  });
});
