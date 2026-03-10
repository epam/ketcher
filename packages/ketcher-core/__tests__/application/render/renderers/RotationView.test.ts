import { select } from 'd3';
import { RotationView } from 'application/render/renderers/TransientView/RotationView';
import { Coordinates } from 'application/editor';
import { D3SvgElementSelection } from 'application/render/types';
import { Vec2 } from 'domain/entities';
import { createSvgElement } from '../../../helpers/dom';

describe('RotationView', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

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

  it('should keep the idle rotation handle in place after moving the center', () => {
    const svg = createSvgElement('svg') as SVGSVGElement;
    const layer = createSvgElement('g') as SVGGElement;
    svg.appendChild(layer);
    document.body.appendChild(svg);
    jest.spyOn(Coordinates, 'canvasToView').mockReturnValue(new Vec2(50, 100));

    RotationView.show(
      select(layer) as unknown as D3SvgElementSelection<SVGGElement, void>,
      {
        center: new Vec2(50, 100),
        boundingBox: {
          left: 80,
          top: 80,
          width: 40,
          height: 40,
        },
        isRotating: false,
      },
    );

    const handleGroup = layer.querySelector('.rotation-handle');
    expect(handleGroup?.getAttribute('transform')).toBe('translate(100,25)');
  });
});
