import { screen, fireEvent, render as rtlRender } from '@testing-library/react';
import { LeftToolbarContainer } from '../views/toolbars';
import { Provider } from 'react-redux';
import createStore from '../state';
import { initKeydownListener } from './hotkeys';
import { act } from 'react-dom/test-utils';

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
        keyCode: 27,
      });
    });
    expect(screen.getByTestId('select-rectangle').className).toContain(
      'selected',
    );
  });

  it('Shift+Tab to switch selection tool', async () => {
    renderWithMockStore(<LeftToolbarContainer />);
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.keyDown(document, {
        keyCode: 9,
        shiftKey: true,
      });
    });
    expect(screen.getByTestId('select-lasso').className).toContain('selected');
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
      render: { ctab: {} },
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
