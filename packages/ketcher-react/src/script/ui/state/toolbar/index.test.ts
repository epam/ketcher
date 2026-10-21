import { initResize, removeResizeListener } from './index';

jest.mock('../../action/tools', () => ({
  __esModule: true,
  default: {},
}));

type ResizeState = {
  editor: null | {
    render: {
      update: jest.Mock<void, []>;
    };
  };
  actionState?: {
    activeTool: string;
  };
};

type ClearVisibleAction = {
  type: 'CLEAR_VISIBLE';
  data: string;
};

describe('initResize', () => {
  afterEach(() => {
    removeResizeListener();
  });

  // Regression test for https://github.com/epam/ketcher/issues/4218:
  // the resize handler ran before the editor was set in the store and threw
  // "Cannot read properties of null (reading 'render')".
  it('should not throw when a resize event fires before state.editor is set', () => {
    const dispatch = jest.fn<void, [ClearVisibleAction]>();
    const getState = jest.fn<ResizeState, []>(() => ({ editor: null }));

    initResize()(dispatch, getState);

    expect(() => globalThis.dispatchEvent(new Event('resize'))).not.toThrow();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should update the editor render and clear the active tool on resize', () => {
    const update = jest.fn<void, []>();
    const dispatch = jest.fn<void, [ClearVisibleAction]>();
    const getState = jest.fn<ResizeState, []>(() => ({
      editor: { render: { update } },
      actionState: { activeTool: 'select' },
    }));

    initResize()(dispatch, getState);
    globalThis.dispatchEvent(new Event('resize'));

    expect(update).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      type: 'CLEAR_VISIBLE',
      data: 'select',
    });
  });

  it('should stop reacting to resize after removeResizeListener is called', () => {
    const update = jest.fn<void, []>();
    const dispatch = jest.fn<void, [ClearVisibleAction]>();
    const getState = jest.fn<ResizeState, []>(() => ({
      editor: { render: { update } },
      actionState: { activeTool: 'select' },
    }));

    initResize()(dispatch, getState);
    removeResizeListener();
    globalThis.dispatchEvent(new Event('resize'));

    expect(update).not.toHaveBeenCalled();
  });
});
