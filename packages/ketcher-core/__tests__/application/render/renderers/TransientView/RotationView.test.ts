/** @jest-environment jsdom */

import { RotationView } from 'application/render/renderers/TransientView/RotationView';
import { Coordinates } from 'application/editor';
import { D3SvgElementSelection } from 'application/render/types';
import { Vec2 } from 'domain/entities';
import { select } from 'd3';

describe('RotationView', () => {
  beforeEach(() => {
    jest
      .spyOn(Coordinates, 'canvasToView')
      .mockImplementation((position) => position);
    jest
      .spyOn(Coordinates, 'viewToCanvas')
      .mockImplementation((position) => position);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders current angle label at the starting position and arc from start to current angle', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const transientLayer = select(svg).append('g');

    RotationView.show(
      transientLayer as unknown as D3SvgElementSelection<SVGGElement, void>,
      {
        center: new Vec2(100, 100),
        boundingBox: {
          left: 80,
          top: 80,
          width: 40,
          height: 40,
        },
        rotationAngle: (75 * Math.PI) / 180,
        isRotating: true,
        cursor: new Vec2(200, 100),
      },
    );

    const angleText = Array.from(svg.querySelectorAll('text')).find(
      (text) => text.textContent === '75°',
    );
    expect(angleText).toBeTruthy();
    expect(Number(angleText?.getAttribute('x'))).toBeCloseTo(120);
    expect(Number(angleText?.getAttribute('y'))).toBeCloseTo(0);

    const arcPath = Array.from(svg.querySelectorAll('path')).find((path) =>
      path.getAttribute('d')?.includes('A90,90 0 0,1'),
    );
    const arcPathValue = arcPath?.getAttribute('d') ?? '';
    expect(arcPathValue).toContain('M100,10A90,90 0 0,1');

    const matches =
      /^M100,10A90,90 0 0,1 ([\d.]+),([\d.]+)$/.exec(arcPathValue) ?? [];
    expect(Number(matches[1])).toBeCloseTo(186.93332436601614);
    expect(Number(matches[2])).toBeCloseTo(76.70628594077313);
  });

  it('renders negative rotation with reverse sweep flag and keeps label at starting position', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const transientLayer = select(svg).append('g');

    RotationView.show(
      transientLayer as unknown as D3SvgElementSelection<SVGGElement, void>,
      {
        center: new Vec2(100, 100),
        boundingBox: {
          left: 80,
          top: 80,
          width: 40,
          height: 40,
        },
        rotationAngle: (-75 * Math.PI) / 180,
        isRotating: true,
        cursor: new Vec2(200, 100),
      },
    );

    const angleText = Array.from(svg.querySelectorAll('text')).find(
      (text) => text.textContent === '-75°',
    );
    expect(angleText).toBeTruthy();
    expect(Number(angleText?.getAttribute('x'))).toBeCloseTo(120);
    expect(Number(angleText?.getAttribute('y'))).toBeCloseTo(0);

    const arcPath = Array.from(svg.querySelectorAll('path')).find((path) =>
      path.getAttribute('d')?.includes('A90,90 0 0,0'),
    );
    expect(arcPath?.getAttribute('d')).toContain('M100,10A90,90 0 0,0');
  });

  it('orients the protractor 0° at the provided startAngle (non-default path)', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const transientLayer = select(svg).append('g');

    // Provide an explicit startAngle of 0 (rightward in canvas coordinates).
    // The protractor's 0° tick should anchor on the right of the center
    // (center.x + radius, center.y), not at the default straight-up position.
    RotationView.show(
      transientLayer as unknown as D3SvgElementSelection<SVGGElement, void>,
      {
        center: new Vec2(100, 100),
        boundingBox: {
          left: 80,
          top: 80,
          width: 40,
          height: 40,
        },
        rotationAngle: (75 * Math.PI) / 180,
        isRotating: true,
        cursor: new Vec2(200, 100),
        startAngle: 0,
      },
    );

    // With radius 90, startAngle=0 places the 0° point at (190, 100).
    // The rotation arc starts at that point.
    const arcPath = Array.from(svg.querySelectorAll('path')).find((path) =>
      path.getAttribute('d')?.includes('A90,90 0 0,1'),
    );
    const arcPathValue = arcPath?.getAttribute('d') ?? '';
    expect(arcPathValue).toContain('M190,100A90,90 0 0,1');
  });

  it('uses large-arc-flag for rotation angles above 180 degrees', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const transientLayer = select(svg).append('g');

    RotationView.show(
      transientLayer as unknown as D3SvgElementSelection<SVGGElement, void>,
      {
        center: new Vec2(100, 100),
        boundingBox: {
          left: 80,
          top: 80,
          width: 40,
          height: 40,
        },
        rotationAngle: (210 * Math.PI) / 180,
        isRotating: true,
        cursor: new Vec2(200, 100),
      },
    );

    const arcPath = Array.from(svg.querySelectorAll('path')).find((path) =>
      path.getAttribute('d')?.includes('A90,90 0 1,1'),
    );
    expect(arcPath?.getAttribute('d')).toContain('M100,10A90,90 0 1,1');
  });
});
