import { describe, expect, it, vi } from 'vitest';

import { screen, fireEvent, render as rtlRender } from '@testing-library/react';
import { LeftToolbarContainer } from '../views/toolbars';
import { Provider } from 'react-redux';
import createStore from '../state';
import { initKeydownListener, removeKeydownListener } from './hotkeys';
import { act, type ReactNode } from 'react';
import { AttachmentGroup, Atom, Bond, Struct, Vec2 } from 'ketcher-core';
import type { Api } from '../../api';
import BondTool from '../../editor/tool/bond';
import type Editor from '../../editor/Editor';

vi.mock('react-intersection-observer', () => {
  return {
    observe: vi.fn(),
    disconnect: vi.fn(),
    useInView: vi.fn().mockReturnValue([]),
  };
});

describe('Hot keys', () => {
  it.each(['KeyC', 'KeyX'])(
    'allows %s immediately after selecting a structure',
    (code) => {
      const { editor, store } = renderWithMockStore(<LeftToolbarContainer />);
      try {
        expect(
          store.getState().actionState?.[code === 'KeyC' ? 'copy' : 'cut'],
        ).toMatchObject({ disabled: true });
        vi.mocked(editor.selection).mockReturnValue({
          atoms: [1],
        });

        const event = new KeyboardEvent('keydown', {
          code,
          key: code === 'KeyC' ? 'c' : 'x',
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        });
        document.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(false);
      } finally {
        store.dispatch(removeKeydownListener(document));
      }
    },
  );

  it('still blocks cut in view-only mode with a selection', () => {
    const { editor, store } = renderWithMockStore(<LeftToolbarContainer />);
    try {
      vi.mocked(editor.selection).mockReturnValue({ atoms: [1] });
      editor.render.options.viewOnlyMode = true;
      const event = new KeyboardEvent('keydown', {
        code: 'KeyX',
        key: 'x',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    } finally {
      store.dispatch(removeKeydownListener(document));
    }
  });

  it('blocks copy immediately after the selection is cleared', () => {
    const { editor, store } = renderWithMockStore(<LeftToolbarContainer />);
    try {
      const selection = vi.mocked(editor.selection);
      selection.mockReturnValue({ atoms: [1] });
      store.dispatch({ type: 'UPDATE' });
      selection.mockReturnValue(null);

      const event = new KeyboardEvent('keydown', {
        code: 'KeyC',
        key: 'c',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    } finally {
      store.dispatch(removeKeydownListener(document));
    }
  });

  it('should select last chosen selected tool when user press ESC', async () => {
    renderWithMockStore(<LeftToolbarContainer />);
    const text = screen.getByTestId('text');

    act(() => {
      fireEvent.click(text);
      fireEvent.keyDown(text, {
        code: 'Escape',
      });
    });
    const className = screen.getByTestId('select-rectangle').className;
    expect(className).toContain('selected');
  });

  it('Shift+Tab to switch selection tool', async () => {
    renderWithMockStore(<LeftToolbarContainer />);

    act(() => {
      fireEvent.keyDown(document, {
        code: 'Tab',
        shiftKey: true,
      });
    });
    expect(screen.getByTestId('select-lasso').className).toContain('selected');
  });

  // Regression test for https://github.com/epam/ketcher/issues/3152:
  // '0' (Any Bond) was missing from the shortcutKeys list used to tell a
  // repeated shortcut press apart from the start of an abbreviation search,
  // so pressing '0' a second time incorrectly opened the Abbreviation
  // Lookup, unlike the equivalent '1'-'4' bond shortcuts.
  it('should not open Abbreviation lookup when pressing "0" (Any Bond) several times', async () => {
    const { store } = renderWithMockStore(<LeftToolbarContainer />);
    act(() => {
      fireEvent.keyDown(document, { code: 'Digit0', key: '0' });
      fireEvent.keyDown(document, { code: 'Digit0', key: '0' });
      fireEvent.keyDown(document, { code: 'Digit0', key: '0' });
    });
    expect(store.getState().abbreviationLookup.isOpen).toBe(false);
  });

  it('does not apply a numeric bond shortcut to a haptic bond with an attachment group', () => {
    const struct = new Struct();
    const endpointId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0) }),
    );
    const attachmentGroupId = struct.addAttachmentGroup(
      new AttachmentGroup({ atomIds: [endpointId] }),
    );
    const centralAtomId = struct.atoms.add(
      new Atom({ label: 'Fe', pp: new Vec2(1, 0) }),
    );
    const hapticBondId = struct.bonds.add(
      new Bond({
        type: Bond.PATTERN.TYPE.HAPTIC,
        begin: attachmentGroupId,
        end: centralAtomId,
      }),
    );
    const update = vi.fn();
    const editor = {
      selection: () => ({ bonds: [hapticBondId] }),
      render: { ctab: { molecule: struct } },
      update,
    } as unknown as Editor;

    const tool = new BondTool(editor, {
      type: Bond.PATTERN.TYPE.SINGLE,
      stereo: Bond.PATTERN.STEREO.NONE,
    });

    expect(tool.isNotActiveTool).toBe(true);
    expect(update).not.toHaveBeenCalled();
    expect(struct.bonds.get(hapticBondId)?.type).toBe(Bond.PATTERN.TYPE.HAPTIC);
  });
});

function renderWithMockStore(component: ReactNode) {
  const store = createStore({}, {} as Api, () => null);
  const struct = new Struct();
  struct.atoms.add(new Atom({ label: 'C' }));
  struct.atoms.add(new Atom({ label: 'C' }));
  store.dispatch(initKeydownListener(document));
  store.dispatch({
    type: 'INIT',
    editor: {
      tool: vi.fn().mockReturnValue(true),
      historySize: () => {
        return { undo: [] };
      },
      selection: vi.fn(),
      struct: () => struct,
      render: {
        ctab: { molecule: struct, bonds: new Map() },
        options: { viewOnlyMode: false },
      },
      zoom: vi.fn(),
      _tool: { mode: '' },
      rotateController: { isRotating: false },
    },
  });
  const editor = store.getState().editor;
  if (!editor) {
    throw new Error('Mock editor was not initialized');
  }
  return {
    ...rtlRender(<Provider store={store}>{component}</Provider>),
    editor,
    store,
  };
}
