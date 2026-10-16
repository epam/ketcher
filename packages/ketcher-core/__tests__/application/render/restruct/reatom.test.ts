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
