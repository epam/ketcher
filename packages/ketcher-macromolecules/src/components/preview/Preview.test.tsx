import { Provider } from 'react-redux';
import { act, render, waitFor } from '@testing-library/react';
import { ZoomTool } from 'ketcher-core';
import { configureAppStore } from 'state';
import { showPreview } from 'state/common';
import { PreviewType } from 'state/types';
import { Preview } from './Preview';

jest.mock('ketcher-core', () => {
  const actual = jest.requireActual('ketcher-core');

  return {
    ...actual,
    ZoomTool: {
      instance: undefined,
    },
  };
});

jest.mock('ketcher-react', () => ({
  AmbiguousMonomerPreview: () => <div>Ambiguous monomer preview</div>,
}));

jest.mock('./components/MonomerPreview/MonomerPreview', () => ({
  __esModule: true,
  default: () => <div>Monomer preview</div>,
}));

jest.mock('./components/PresetPreview/PresetPreview', () => ({
  __esModule: true,
  default: () => <div>Preset preview</div>,
}));

jest.mock('./components/BondPreview/BondPreview', () => ({
  __esModule: true,
  default: () => <div>Bond preview</div>,
}));

describe('Preview', () => {
  const previewRect = {
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    bottom: 60,
    right: 150,
    width: 150,
    height: 60,
    toJSON: () => ({}),
  };

  const targetRect = {
    x: 80,
    y: 120,
    top: 120,
    left: 80,
    bottom: 160,
    right: 200,
    width: 120,
    height: 40,
    toJSON: () => ({}),
  };

  const canvasWrapperRect = {
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    bottom: 500,
    right: 500,
    width: 500,
    height: 500,
    toJSON: () => ({}),
  };

  let getBoundingClientRectMock: jest.SpyInstance;

  beforeEach(() => {
    getBoundingClientRectMock = jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(() => previewRect as DOMRect);

    const zoomTool = ZoomTool as unknown as {
      instance: { canvasWrapper: { node: () => SVGSVGElement } };
    };

    zoomTool.instance = {
      canvasWrapper: {
        node: () =>
          ({
            getBoundingClientRect: () => canvasWrapperRect as DOMRect,
          } as unknown as SVGSVGElement),
      },
    };
  });

  afterEach(() => {
    getBoundingClientRectMock.mockRestore();
  });

  it('centers the tooltip for wide hovered monomers instead of snapping it to the canvas edge', async () => {
    const store = configureAppStore();
    const target = document.createElement('div');

    target.getBoundingClientRect = () => targetRect as DOMRect;

    const { container } = render(
      withThemeProvider(
        <Provider store={store}>
          <Preview />
        </Provider>,
      ),
    );

    act(() => {
      store.dispatch(
        showPreview({
          type: PreviewType.Monomer,
          target,
          monomer: undefined,
        }),
      );
    });

    await waitFor(() => {
      expect(container.firstElementChild).toHaveStyle('left: 65px');
    });
  });
});
