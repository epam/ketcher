import {
  checkIsSmartPropertiesExist,
  getAtomCustomQuery,
} from 'application/render/restruct';
import { Atom, Bond, Box2Abs, Struct, Vec2 } from 'domain/entities';
import { AtomCIP } from 'domain/entities/types';
import ReAtom from 'application/render/restruct/reatom';
import ReBond from 'application/render/restruct/rebond';
import type ReStruct from 'application/render/restruct/restruct';
import type { RenderOptions } from 'application/render/render.types';
import { StereoColoringType } from 'application/render/restruct/generalEnumTypes';

describe('atom annotation DOM traversal', () => {
  it('applies stereo styling and an escaped query tooltip to the first tspan', () => {
    const atom = new Atom({
      label: 'C',
      stereoLabel: '&2',
      queryProperties: { customQuery: 'query<one>;query&two' },
    });
    const molecule = new Struct();
    const aid = molecule.atoms.add(atom);
    const reatom = new ReAtom(atom);
    const nodes: SVGElement[] = [];
    const text = jest.fn(() => {
      const node = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text',
      );
      node.append(
        document.createElementNS('http://www.w3.org/2000/svg', 'tspan'),
        document.createElementNS('http://www.w3.org/2000/svg', 'tspan'),
      );
      nodes.push(node);
      return {
        node,
        attr: jest.fn().mockReturnThis(),
        getBBox: () => ({ x: 0, y: 0, width: 10, height: 10 }),
        translateAbs: jest.fn(),
      };
    });
    const options = {
      microModeScale: 1,
      zoom: 1,
      lineWidth: 1,
      fontszInPx: 13,
      fontszsubInPx: 10,
      colorOfAndCenters: '#123456',
      colorStereogenicCenters: StereoColoringType.LabelsOnly,
      autoFadeOfStereoLabels: true,
      ignoreChiralFlag: true,
    } as RenderOptions;
    const restruct = {
      molecule,
      render: { paper: { text }, options },
      addReObjectPath: jest.fn(),
    } as unknown as ReStruct;
    jest.spyOn(reatom, 'setHover').mockImplementation(() => undefined);

    reatom.show(restruct, aid, options);

    const annotation = nodes[nodes.length - 1];
    const firstSpan = annotation.firstChild as SVGElement;
    expect(firstSpan.getAttribute('fill')).toBe('#123456');
    expect(firstSpan.getAttribute('fill-opacity')).toBe('0.9');
    expect(firstSpan.getAttribute('data-tooltip')).toBe(
      'query&lt;one&gt;; query&two',
    );
    expect((annotation.lastChild as SVGElement).attributes).toHaveLength(0);
  });
});

describe('CIP labels avoid bond geometry', () => {
  it('keeps empty corners of the rendered bond bounds available', () => {
    const renderer = new ReBond(new Bond({ begin: 0, end: 1, type: 1 }));
    const offset = new Vec2(100, 50);
    renderer.visel.boxes.push(new Box2Abs(100, 50, 120, 70));
    renderer.path = {
      attr: () => 'M0,0L20,20',
    } as unknown as ReBond['path'];

    const boxes = renderer.getCIPCollisionBoxes(
      { offset, lineWidth: 1 } as RenderOptions,
      1,
    );

    expect(boxes.some((box) => box.contains(new Vec2(2, 18)))).toBe(false);
    expect(boxes.some((box) => box.contains(new Vec2(10, 10)))).toBe(true);
  });

  it.each([
    undefined,
    Bond.PATTERN.STEREO.NONE,
    Bond.PATTERN.STEREO.UP,
    Bond.PATTERN.STEREO.DOWN,
  ])(
    'keeps CIP close to its center without crossing a bond (stereo %s)',
    (stereo) => {
      const struct = new Struct();
      const atomId = struct.atoms.add(
        new Atom({ label: 'C', pp: new Vec2(), cip: AtomCIP.S }),
      );
      const atomRenderer = new ReAtom(struct.atoms.get(atomId)!);
      const bondRenderer = new ReBond(
        new Bond({ begin: atomId, end: atomId + 1, type: 1, stereo }),
      );
      const offset = new Vec2(100, 50);
      const bondBox = new Box2Abs(-2, -15, 2, -5);
      bondRenderer.visel.boxes.push(bondBox.translate(offset));
      const labelBox = { x: -3, y: -3, width: 6, height: 6 };
      const text = {
        attr: jest.fn().mockReturnThis(),
        getBBox: () => labelBox,
      };
      const rectangle = { attr: jest.fn().mockReturnThis() };
      const group = {
        push: jest.fn(),
        getBBox: () => labelBox,
        translateAbs: jest.fn(),
      };
      const options = {
        microModeScale: 1,
        fontszInPx: 10,
        offset,
      } as RenderOptions;
      const restruct = {
        molecule: struct,
        atoms: new Map([[atomId, atomRenderer]]),
        bonds: new Map(stereo === undefined ? [] : [[0, bondRenderer]]),
        addReObjectPath: jest.fn(),
        render: {
          paper: { text: () => text, rect: () => rectangle, set: () => group },
          viewBox: { minX: -100, minY: -100, width: 200, height: 200 },
        },
      } as unknown as ReStruct;
      restruct.render.ctab = restruct;

      atomRenderer.showCIPLabel(restruct, atomId, options);

      const [shiftX, shiftY] = group.translateAbs.mock.calls[0];
      const placedBox = Box2Abs.fromRelBox(labelBox).translate(
        new Vec2(shiftX, shiftY),
      );
      if (stereo === undefined) {
        expect(placedBox.centre().y).toBeCloseTo(-8);
      } else {
        expect(placedBox.p1.y).toBeLessThan(bondBox.p0.y);
      }
      expect(placedBox.centre().x).toBeCloseTo(0);
      restruct.render.viewBox = {
        minX: 500,
        minY: 500,
        width: 200,
        height: 200,
      };
      atomRenderer.showCIPLabel(restruct, atomId, options);
      const [offscreenShiftX, offscreenShiftY] =
        group.translateAbs.mock.calls[1];
      expect(offscreenShiftX).toBeCloseTo(shiftX);
      expect(offscreenShiftY).toBeCloseTo(shiftY);
    },
  );

  it.each([
    { x: 101, y: 220 },
    { x: 139, y: 220 },
    { x: 120, y: 201 },
    { x: 120, y: 239 },
  ])(
    'keeps a blocked CIP label inside the viewport near ($x, $y)',
    ({ x, y }) => {
      const struct = new Struct();
      const atomId = struct.atoms.add(
        new Atom({ label: 'C', pp: new Vec2(x, y), cip: AtomCIP.S }),
      );
      const atomRenderer = new ReAtom(struct.atoms.get(atomId)!);
      const labelBox = { x: x - 3, y: y - 3, width: 6, height: 6 };
      const text = {
        attr: jest.fn().mockReturnThis(),
        getBBox: () => labelBox,
      };
      const rectangle = { attr: jest.fn().mockReturnThis() };
      const group = {
        push: jest.fn(),
        getBBox: () => labelBox,
        translateAbs: jest.fn(),
      };
      const visibleBox = new Box2Abs(100, 200, 140, 240);
      const options = {
        microModeScale: 1,
        fontszInPx: 10,
        offset: new Vec2(),
      } as RenderOptions;
      const restruct = {
        molecule: struct,
        atoms: new Map([[atomId, atomRenderer]]),
        bonds: new Map([[0, { getCIPCollisionBoxes: () => [visibleBox] }]]),
        addReObjectPath: jest.fn(),
        render: {
          paper: { text: () => text, rect: () => rectangle, set: () => group },
          viewBox: { minX: 100, minY: 200, width: 40, height: 40 },
        },
      } as unknown as ReStruct;
      restruct.render.ctab = restruct;

      atomRenderer.showCIPLabel(restruct, atomId, options);

      const [shiftX, shiftY] = group.translateAbs.mock.calls[0];
      expect(Number.isFinite(shiftX)).toBe(true);
      expect(Number.isFinite(shiftY)).toBe(true);
      const placedBox = Box2Abs.fromRelBox(labelBox).translate(
        new Vec2(shiftX, shiftY),
      );
      expect(visibleBox.contains(placedBox.p0)).toBe(true);
      expect(visibleBox.contains(placedBox.p1)).toBe(true);
    },
  );
});

describe('atom query properties rendering', () => {
  it.each([
    { implicitHCount: 0, expected: 'h0' },
    {
      queryProperties: { ringMembership: 0 },
      expected: 'R0',
    },
    {
      queryProperties: { ringSize: 0 },
      expected: 'r0',
    },
    {
      queryProperties: { connectivity: 0 },
      expected: 'X0',
    },
  ])('renders $expected for a zero-valued query property', (attributes) => {
    const atom = new Atom({
      label: 'C',
      ...attributes,
    });

    expect(checkIsSmartPropertiesExist(atom)).toBe(true);
    expect(
      getAtomCustomQuery({
        ...atom,
        ...atom.queryProperties,
      }),
    ).toBe(attributes.expected);
  });
});
