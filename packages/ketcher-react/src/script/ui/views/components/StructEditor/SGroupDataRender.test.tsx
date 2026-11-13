import { render, screen } from '@testing-library/react';
import type { Render, SGroup } from 'ketcher-core';
import SGroupDataRender from './SGroupDataRender';

jest.mock('ketcher-core', () => ({
  ...jest.requireActual('ketcher-core'),
  CoordinateTransformation: {
    canvasToView: (point: { x: number; y: number }) => point,
  },
}));

const editorRender = {
  clientArea: { clientHeight: 1000, clientWidth: 1000 },
} as unknown as Render;

const renderTooltip = (hovering: unknown) =>
  render(
    <SGroupDataRender
      clientX={500}
      clientY={300}
      render={editorRender}
      sGroup={{ hovering } as unknown as SGroup}
      sGroupData="mass=12"
    />,
  );

describe('SGroupDataRender', () => {
  it('shows the data next to a drawn hover outline', () => {
    renderTooltip({
      removed: false,
      attrs: {
        path: [
          ['M', 100, 100],
          ['L', 100, 140],
          ['L', 160, 140],
          ['L', 160, 100],
          ['L', 100, 100],
        ],
      },
    });

    expect(screen.getByText('mass=12')).toBeInTheDocument();
  });

  // Hovering a selected data s-group: drawHover does not redraw the outline
  // so `hovering` is still the outline from an earlier hover, which Raphael
  // has removed (removed: true, attrs: null). The editor used to crash here.
  it('shows nothing for a removed hover outline instead of crashing', () => {
    const { container } = renderTooltip({ removed: true, attrs: null });

    expect(container).toBeEmptyDOMElement();
  });
});
