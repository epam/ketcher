import { select } from 'd3';
import { RotationView } from 'application/render/renderers/TransientView/RotationView';
import { Coordinates } from 'application/editor';
import type { D3SvgElementSelection } from 'application/render/types';
import { Vec2 } from 'domain/entities';
import { createSvgElement } from '../../../helpers/dom';

describe('RotationView', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    [
      'rotation handle',
      '.rotation-handle',
      RotationView.subscribeRotationHandle,
    ],
    [
      'rotation center',
      '.rotation-center-handle rect',
      RotationView.subscribeRotationCenter,
    ],
  ] as const)(
    'dispatches mouse down and drag events for the %s',
    (_, selector, subscribe) => {
      const svg = createSvgElement('svg') as SVGSVGElement;
      const layer = createSvgElement('g') as SVGGElement;
      svg.appendChild(layer);
      RotationView.show(
        select(layer) as unknown as D3SvgElementSelection<SVGGElement, void>,
        {
          center: new Vec2(100, 100),
          boundingBox: { left: 80, top: 80, width: 40, height: 40 },
          isRotating: false,
        },
      );
      const target = svg.querySelector(selector);
      const listener = jest.fn();
      const unsubscribe = subscribe(listener);
      const mouseDown = new MouseEvent('mousedown', {
        buttons: 1,
        bubbles: true,
        cancelable: true,
      });
      const mouseMove = new MouseEvent('mousemove', { buttons: 1 });

      try {
        expect(target).not.toBeNull();
        target?.dispatchEvent(mouseDown);
        expect(listener).toHaveBeenNthCalledWith(1, {
          type: 'down',
          event: mouseDown,
        });
        expect(mouseDown.defaultPrevented).toBe(true);

        target?.dispatchEvent(new MouseEvent('mousemove', { buttons: 0 }));
        expect(listener).toHaveBeenCalledTimes(1);

        target?.dispatchEvent(mouseMove);
        expect(listener).toHaveBeenNthCalledWith(2, {
          type: 'drag',
          event: mouseMove,
        });
        expect(listener).toHaveBeenCalledTimes(2);
      } finally {
        unsubscribe();
      }
    },
  );

  it('should render active rotation handle style in rotating mode', () => {
    const svg = createSvgElement('svg') as SVGSVGElement;
    const layer = createSvgElement('g') as SVGGElement;
    svg.appendChild(layer);
    document.body.appendChild(svg);
    jest.spyOn(Coordinates, 'canvasToView').mockReturnValue(new Vec2(100, 100));

    RotationView.show(
      select(layer) as unknown as D3SvgElementSelection<SVGGElement, void>,
      {
        center: new Vec2(100, 100),
        boundingBox: {
          left: 80,
          top: 80,
          width: 40,
          height: 40,
        },
        isRotating: true,
      },
    );

    const handleCircle = layer.querySelector('.rotation-handle circle');
    const handleArrows = layer.querySelectorAll('.rotation-handle g path');

    expect(handleCircle?.getAttribute('fill')).toBe('#365CFF');
    expect(handleCircle?.getAttribute('style')).toContain('cursor: grabbing');
    handleArrows.forEach((arrow) => {
      expect(arrow.getAttribute('fill')).toBe('none');
    });
  });

  it('should highlight rotation handle on hover when not rotating', () => {
    const svg = createSvgElement('svg') as SVGSVGElement;
    const layer = createSvgElement('g') as SVGGElement;
    svg.appendChild(layer);
    document.body.appendChild(svg);
    jest.spyOn(Coordinates, 'canvasToView').mockReturnValue(new Vec2(100, 100));

    RotationView.show(
      select(layer) as unknown as D3SvgElementSelection<SVGGElement, void>,
      {
        center: new Vec2(100, 100),
        boundingBox: {
          left: 80,
          top: 80,
          width: 40,
          height: 40,
        },
        isRotating: false,
      },
    );

    const handleGroup = layer.querySelector('.rotation-handle') as SVGGElement;
    const handleCircle = layer.querySelector('.rotation-handle circle');

    expect(handleCircle?.getAttribute('fill')).toBe('#B4B9D6');

    handleGroup.dispatchEvent(new Event('mouseenter'));
    expect(handleCircle?.getAttribute('fill')).toBe('#365CFF');

    handleGroup.dispatchEvent(new Event('mouseleave'));
    expect(handleCircle?.getAttribute('fill')).toBe('#B4B9D6');
  });
});
