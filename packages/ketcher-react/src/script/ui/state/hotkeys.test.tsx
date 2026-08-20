import { screen, fireEvent, render as rtlRender } from '@testing-library/react';
import { LeftToolbarContainer } from '../views/toolbars';
import { Provider } from 'react-redux';
import createStore from '../state';
import { initKeydownListener } from './hotkeys';
import { act } from 'react';

jest.mock('react-intersection-observer', () => {
  return {
    observe: jest.fn(),
    disconnect: jest.fn(),
    useInView: jest.fn().mockReturnValue([]),
  };
});

describe('Hot keys', () => {
  it('should select last chosen selected tool when user press ESC', async () => {
    renderWithMockStore(<LeftToolbarContainer />);
    const text = screen.getByTestId('text');
    // eslint-disable-next-line testing-library/no-unnecessary-act
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
    // eslint-disable-next-line testing-library/no-unnecessary-act
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
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.keyDown(document, { code: 'Digit0', key: '0' });
      fireEvent.keyDown(document, { code: 'Digit0', key: '0' });
      fireEvent.keyDown(document, { code: 'Digit0', key: '0' });
    });
    expect(store.getState().abbreviationLookup.isOpen).toBe(false);
  });
});

function renderWithMockStore(component) {
  const store = createStore({}, {}, () => null);
  store.dispatch(initKeydownListener(document));
  store.dispatch({
    type: 'INIT',
    editor: {
      tool: jest.fn().mockReturnValue(true),
      historySize: () => {
        return { undo: [] };
      },
      selection: jest.fn(),
      struct: () => {
        return { atoms: { keys: () => new Set() } };
      },
      render: { ctab: {}, options: { viewOnlyMode: false } },
      zoom: jest.fn(),
      _tool: { mode: '' },
      rotateController: { isRotating: false },
    },
  });
  return {
    ...rtlRender(<Provider store={store}>{component}</Provider>),
    store,
  };
}
