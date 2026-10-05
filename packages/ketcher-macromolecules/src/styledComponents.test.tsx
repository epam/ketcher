import { render, screen } from '@testing-library/react';
import { CanvasWrapper } from './styledComponents';

describe('connection drawing hit targets', () => {
  it('disables atomic bond hit areas while preserving atom targets and restores bonds afterward', () => {
    render(
      <CanvasWrapper data-testid="canvas">
        <g data-testid="atom" pointerEvents="all">
          <circle data-testid="atom-hit-area" r="8" />
        </g>
        <g data-testid="bond" data-fromatomid="1" data-toatomid="2">
          <path
            data-testid="bond-hit-area"
            stroke="transparent"
            strokeWidth="8"
            d="M0,0L40,0"
          />
          <rect data-testid="bond-annotation" width="10" height="10" />
        </g>
        <g pointerEvents="stroke">
          <path
            data-testid="flex-polymer-bond"
            data-frommonomerid="3"
            data-tomonomerid="4"
            pointerEvents="stroke"
            d="M0,20L40,20"
          />
          <line
            data-testid="snake-polymer-bond"
            data-frommonomerid="3"
            data-tomonomerid="4"
            pointerEvents="stroke"
            x1="0"
            y1="40"
            x2="40"
            y2="40"
          />
          <line
            data-testid="polymer-hit-area"
            stroke="transparent"
            strokeWidth="10"
          />
        </g>
      </CanvasWrapper>,
    );
    const canvas = screen.getByTestId('canvas');
    const bond = screen.getByTestId('bond');
    const hitArea = screen.getByTestId('bond-hit-area');
    const atom = screen.getByTestId('atom');
    const polymerElements = [
      screen.getByTestId('flex-polymer-bond'),
      screen.getByTestId('snake-polymer-bond'),
      screen.getByTestId('polymer-hit-area'),
    ];
    // Both renderer modes use data-testid="bond" on the body.
    polymerElements
      .slice(0, 2)
      .forEach((element) => element.setAttribute('data-testid', 'bond'));
    const polymerPointerEvents = polymerElements.map(
      (element) => getComputedStyle(element).pointerEvents,
    );

    expect(getComputedStyle(hitArea).pointerEvents).not.toBe('none');
    canvas.setAttribute('data-drawing-connection', '');

    expect(getComputedStyle(bond).pointerEvents).toBe('none');
    expect(getComputedStyle(hitArea).pointerEvents).toBe('none');
    expect(
      getComputedStyle(screen.getByTestId('bond-annotation')).pointerEvents,
    ).toBe('none');
    expect(getComputedStyle(atom).pointerEvents).not.toBe('none');
    expect(
      getComputedStyle(screen.getByTestId('atom-hit-area')).pointerEvents,
    ).not.toBe('none');
    expect(
      polymerElements.map((element) => getComputedStyle(element).pointerEvents),
    ).toEqual(polymerPointerEvents);

    // Newly rendered bonds must respect the active state as well.
    const replacement = hitArea.cloneNode(true) as SVGPathElement;
    hitArea.replaceWith(replacement);
    expect(getComputedStyle(replacement).pointerEvents).toBe('none');

    canvas.removeAttribute('data-drawing-connection');
    expect(getComputedStyle(bond).pointerEvents).not.toBe('none');
    expect(getComputedStyle(replacement).pointerEvents).not.toBe('none');
    expect(
      polymerElements.map((element) => getComputedStyle(element).pointerEvents),
    ).toEqual(polymerPointerEvents);
  });
});
