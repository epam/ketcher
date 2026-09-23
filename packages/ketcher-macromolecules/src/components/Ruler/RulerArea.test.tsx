import { render, screen } from '@testing-library/react';
import { useSelector } from 'react-redux';

import { RootSizeContext } from '../../contexts';

import { RulerArea } from './RulerArea';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('hooks', () => ({
  useLayoutMode: () => 'sequence-layout-mode',
}));

jest.mock('../../hooks/useZoomTransform', () => ({
  useZoomTransform: () => ({
    applyX: (value: number) => value,
    invertX: (value: number) => value,
  }),
}));

jest.mock('./RulerInput', () => ({
  __esModule: true,
  default: ({ offsetX }: { offsetX: number }) => (
    <input data-testid="ruler-input" data-offset-x={offsetX} />
  ),
}));

jest.mock('./RulerHandle', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('./RulerScale', () => ({
  __esModule: true,
  default: () => null,
}));

describe('RulerArea', () => {
  it('moves a persisted ruler input into view when the editor becomes visible', () => {
    let canvasContainerWidth = 0;
    const canvasContainer = document.createElement('div');
    Object.defineProperty(canvasContainer, 'clientWidth', {
      get: () => canvasContainerWidth,
    });
    const canvas = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg',
    );
    canvasContainer.appendChild(canvas);

    const editor = {
      canvas,
      events: {
        setEditorLineLength: { dispatch: jest.fn() },
        toggleLineLengthHighlighting: { dispatch: jest.fn() },
      },
    };

    (useSelector as unknown as jest.Mock).mockImplementation((selector) => {
      const selectorName = selector.name;

      if (selectorName === 'selectEditorLineLength') {
        return {
          'sequence-layout-mode': 210,
          'snake-layout-mode': 30,
          'flex-layout-mode': 30,
        };
      }

      return editor;
    });

    const { rerender } = render(
      <RootSizeContext.Provider value={{ width: 0, height: 0 }}>
        <RulerArea />
      </RootSizeContext.Provider>,
    );

    expect(screen.getByTestId('ruler-input')).toHaveAttribute(
      'data-offset-x',
      '4460',
    );

    canvasContainerWidth = 900;
    rerender(
      <RootSizeContext.Provider value={{ width: 1200, height: 800 }}>
        <RulerArea />
      </RootSizeContext.Provider>,
    );

    expect(screen.getByTestId('ruler-input')).toHaveAttribute(
      'data-offset-x',
      '865',
    );
  });
});
