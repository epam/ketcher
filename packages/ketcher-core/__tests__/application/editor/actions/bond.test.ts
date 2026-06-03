import * as utils from 'application/editor/actions/utils';

import { type Action, fromBondAddition } from 'application/editor/actions';
import { Render, ReStruct } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import { Atom, Bond, Struct, Vec2 } from 'domain/entities';

import { restruct, singleBond } from '../../../mock-data';

type AtomCoords = [number, number];
type BondCoords = [number, number, Bond['type']?];

const MODEL_BOND_LENGTH = 1;
const ATOM_COLLISION_DISTANCE = 0.9;
const BOND_COLLISION_DISTANCE = 0.35;

function createReStruct(
  atomCoords: AtomCoords[],
  bondCoords: BondCoords[] = [],
) {
  const struct = new Struct();
  const atomIds = atomCoords.map(([x, y]) =>
    struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(x, y) })),
  );

  const bondIds = bondCoords.map(([beginIndex, endIndex, type]) => {
    const bond = new Bond({
      begin: atomIds[beginIndex],
      end: atomIds[endIndex],
      type: type ?? Bond.PATTERN.TYPE.SINGLE,
    });
    return struct.bonds.add(bond);
  });

  struct.initHalfBonds();
  struct.initNeighbors();
  struct.updateHalfBonds(Array.from(struct.atoms.keys()));
  struct.sortNeighbors(Array.from(struct.atoms.keys()));

  const options = {
    scale: 40,
    width: 100,
    height: 100,
  } as unknown as RenderOptions;
  const render = new Render(document as unknown as HTMLElement, options);
  const reStruct = new ReStruct(struct, render);
  reStruct.recalculateVisibleAtomsAndBonds();

  return { atomIds, bondIds, reStruct, struct };
}

function angleFrom(origin: Vec2, point: Vec2) {
  const angle = Math.atan2(point.y - origin.y, point.x - origin.x);
  return angle < 0 ? angle + 2 * Math.PI : angle;
}

function pointToSegmentDistance(point: Vec2, start: Vec2, end: Vec2) {
  const segment = Vec2.diff(end, start);
  const segmentLengthSq = segment.x * segment.x + segment.y * segment.y;
  const toPoint = Vec2.diff(point, start);
  const projection =
    (toPoint.x * segment.x + toPoint.y * segment.y) / segmentLengthSq;
  const clampedProjection = Math.max(0, Math.min(1, projection));
  const closestPoint = new Vec2(
    start.x + segment.x * clampedProjection,
    start.y + segment.y * clampedProjection,
  );

  return Vec2.dist(point, closestPoint);
}

describe('atomForNewBond', () => {
  it('places a new atom away from a crowded preferred direction', () => {
    const { atomIds, reStruct } = createReStruct([
      [0, 0],
      [MODEL_BOND_LENGTH, 0],
    ]);

    const { pos } = utils.atomForNewBond(reStruct, atomIds[0]);

    expect(
      Vec2.dist(pos, new Vec2(MODEL_BOND_LENGTH, 0)),
    ).toBeGreaterThanOrEqual(ATOM_COLLISION_DISTANCE);
    expect(angleFrom(new Vec2(0, 0), pos)).not.toBeCloseTo(0);
  });

  it('uses the widest free sector for a branched atom', () => {
    const { atomIds, reStruct } = createReStruct(
      [
        [0, 0],
        [MODEL_BOND_LENGTH, 0],
        [-0.5, Math.sqrt(3) / 2],
      ],
      [
        [0, 1],
        [0, 2],
      ],
    );

    const { pos } = utils.atomForNewBond(reStruct, atomIds[0]);

    expect(angleFrom(new Vec2(0, 0), pos)).toBeCloseTo((4 * Math.PI) / 3);
    expect(Vec2.dist(pos, new Vec2(MODEL_BOND_LENGTH, 0))).toBeGreaterThan(
      ATOM_COLLISION_DISTANCE,
    );
    expect(Vec2.dist(pos, new Vec2(-0.5, Math.sqrt(3) / 2))).toBeGreaterThan(
      ATOM_COLLISION_DISTANCE,
    );
  });

  it('avoids placing a new atom on top of a nearby visible bond', () => {
    const { atomIds, reStruct } = createReStruct(
      [
        [0, 0],
        [0.9, -0.5],
        [0.9, 0.5],
      ],
      [[1, 2]],
    );

    const { pos } = utils.atomForNewBond(reStruct, atomIds[0]);

    expect(
      pointToSegmentDistance(pos, new Vec2(0.9, -0.5), new Vec2(0.9, 0.5)),
    ).toBeGreaterThanOrEqual(BOND_COLLISION_DISTANCE);
  });

  it('preserves 180 degree placement for matching multiple bonds', () => {
    const { atomIds, bondIds, reStruct, struct } = createReStruct(
      [
        [0, 0],
        [MODEL_BOND_LENGTH, 0],
        [MODEL_BOND_LENGTH, MODEL_BOND_LENGTH],
      ],
      [[0, 1, Bond.PATTERN.TYPE.DOUBLE]],
    );
    const previousBond = struct.bonds.get(bondIds[0]);
    if (!previousBond) {
      throw new Error('Previous bond should exist');
    }
    previousBond.angle = 0;

    const { pos } = utils.atomForNewBond(
      reStruct,
      atomIds[1],
      new Bond({
        begin: atomIds[1],
        end: atomIds[1],
        type: Bond.PATTERN.TYPE.DOUBLE,
      }),
    );

    expect(pos.x).toBeCloseTo(2 * MODEL_BOND_LENGTH);
    expect(pos.y).toBeCloseTo(0);
  });

  it('keeps zig-zag placement for a chain end', () => {
    const { atomIds, reStruct } = createReStruct(
      [
        [0, 0],
        [MODEL_BOND_LENGTH, 0],
      ],
      [[0, 1]],
    );

    const { pos } = utils.atomForNewBond(reStruct, atomIds[1]);

    expect(angleFrom(new Vec2(MODEL_BOND_LENGTH, 0), pos)).toBeCloseTo(
      Math.PI / 3,
    );
    expect(Vec2.dist(pos, new Vec2(0, 0))).toBeGreaterThan(
      ATOM_COLLISION_DISTANCE,
    );
  });
});

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('Bond Addition', () => {
  let reStruct!: ReStruct;
  let action: Action;
  let begin: number;
  let end: number;

  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const legacyReStruct = { ...((restruct as any) || {}) };
    legacyReStruct.molecule.sgroups = [];
    legacyReStruct.visibleAtoms = new Map();
    const [actionData, beginData, endData] = fromBondAddition(
      legacyReStruct,
      singleBond,
      1,
      {
        label: 'C',
      },
    );

    action = actionData;
    begin = beginData;
    end = endData;
    reStruct = legacyReStruct;
  });

  test('function `atomForNewBond` will be called if `endAtomPos` is `undefined`', () => {
    const spy = jest.spyOn(utils, 'atomForNewBond');
    fromBondAddition(reStruct, singleBond, 3, { label: 'C' });
    expect(spy).toHaveBeenCalled();
  });
  test('function `atomGetAttr` will be called', () => {
    const spy = jest.spyOn(utils, 'atomGetAttr');
    fromBondAddition(reStruct, singleBond, 5, 1);
    expect(spy).toHaveBeenCalled();
  });
  it('should contain operation CalcImplicitH', () => {
    const CalcImplicitH = action.operations.find(
      (operation) => operation.type === 'Calculate implicit hydrogen',
    );
    expect(CalcImplicitH).toBeDefined();
  });
  it('should contain operation Add fragment stereo flag', () => {
    const addFragment = action.operations.find(
      (operation) => operation.type === 'Add fragment stereo flag',
    );
    expect(addFragment).toBeDefined();
  });
  test('bond begin should be defined', () => {
    expect(begin).toBeDefined();
  });
  test('bond end should be defined', () => {
    expect(end).toBeDefined();
  });
});
