import { ReStruct, Render } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import { Atom, Bond, Struct, Vec2 } from 'domain/entities';

describe('dative valence rendering', () => {
  const option = {
    microModeScale: 20,
    width: 100,
    height: 100,
  } as RenderOptions;

  const mockSvgGeometry = () => {
    const svgSvgElement = window.SVGSVGElement.prototype as unknown as {
      createSVGMatrix: () => DOMMatrix;
      createSVGPoint: () => DOMPoint;
    };
    svgSvgElement.createSVGMatrix = () =>
      ({
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: 0,
        f: 0,
        inverse() {
          return this;
        },
        multiply() {
          return this;
        },
        translate() {
          return this;
        },
        scale() {
          return this;
        },
        rotate() {
          return this;
        },
      }) as unknown as DOMMatrix;
    svgSvgElement.createSVGPoint = () =>
      ({
        x: 0,
        y: 0,
        matrixTransform() {
          return this;
        },
      }) as unknown as DOMPoint;
    window.SVGElement.prototype.getBBox = () =>
      ({ x: 0, y: 0, width: 10, height: 10 }) as DOMRect;
  };

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('draws the valence underline for an over-limit acceptor and the hydrogen label for a donor', () => {
    mockSvgGeometry();

    const struct = new Struct();
    const carbonId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0) }),
    );
    const donorIds = [
      struct.atoms.add(new Atom({ label: 'N', pp: new Vec2(-1, 1) })),
      struct.atoms.add(new Atom({ label: 'N', pp: new Vec2(1, 1) })),
      struct.atoms.add(new Atom({ label: 'N', pp: new Vec2(0, -1) })),
    ];
    donorIds.forEach((donorId) => {
      const bondId = struct.bonds.add(
        new Bond({
          begin: donorId,
          end: carbonId,
          type: Bond.PATTERN.TYPE.DATIVE,
        }),
      );
      struct.bondInitHalfBonds(bondId, struct.bonds.get(bondId) as Bond);
    });

    struct.initNeighbors();
    struct.setImplicitHydrogen();

    const container = document.createElement('div');
    document.body.appendChild(container);
    const render = new Render(container, option);
    const restruct = new ReStruct(struct, render);
    restruct.update(true);

    const visibleText = Array.from(container.querySelectorAll('text')).map(
      (element) => element.textContent,
    );
    const warningPaths = Array.from(container.querySelectorAll('path')).filter(
      (path) => path.getAttribute('stroke') === '#ff0000',
    );

    expect(struct.atoms.get(carbonId)?.badConn).toBe(true);
    expect(warningPaths.length).toBe(1);
    expect(visibleText).toContain('N');
    expect(visibleText).toContain('H');
    expect(visibleText).toContain('3');
  });
});
