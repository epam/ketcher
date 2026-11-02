import {
  bondAngleDeg,
  getImplicitHydrogenSide,
  ImplicitHydrogenSide,
} from '../implicitHydrogenSide';

// Angles are visual: 0 = right, 90 = up. Expected sides come from the
// "atom-editing" spec of the dynamic-implicit-hydrogen-position change.
type Row = [string, number[], boolean, ImplicitHydrogenSide];

describe('getImplicitHydrogenSide', () => {
  describe('terminal atom', () => {
    const rows: Row[] = [
      ['no bond', [], false, 'right'],
      ['bond up-right at 30 degrees', [30], false, 'left'],
      ['bond down-left at 210 degrees', [210], false, 'right'],
      ['bond exactly right', [0], false, 'left'],
      ['bond exactly left', [180], false, 'right'],
      ['bond exactly up', [90], false, 'right'],
      ['bond exactly down', [270], false, 'right'],
      ['bond 0.4 degrees right of up', [89.6], false, 'right'],
      ['bond 0.4 degrees left of up', [90.4], false, 'right'],
      ['bond 0.5 degrees right of up', [89.5], false, 'right'],
      ['bond 0.4 degrees left of down', [269.6], false, 'right'],
      ['bond 0.4 degrees right of down', [270.4], false, 'right'],
      ['bond 1 degree right of up', [89], false, 'left'],
      ['bond 1 degree right of down', [271], false, 'left'],
      ['bond 1 degree left of up', [91], false, 'right'],
      ['bond given as negative angle to the right', [-30], false, 'left'],
      ['bond given as angle above 360 to the right', [390], false, 'left'],
      ['one bond with a radical', [30], true, 'left'],
    ];

    it.each(rows)('%s', (_name, angles, hasRadical, expected) => {
      expect(getImplicitHydrogenSide(angles, hasRadical)).toBe(expected);
    });
  });

  describe('internal atom', () => {
    const rows: Row[] = [
      ['two bonds pointing down (210, 330) go top', [210, 330], false, 'top'],
      ['bonds in top and bottom quadrants go right', [90, 270], false, 'right'],
      [
        'right and left bonds with a radical go bottom',
        [0, 180],
        true,
        'bottom',
      ],
      [
        'all four quadrants occupied go right',
        [0, 90, 180, 270],
        false,
        'right',
      ],
      ['no bond with a radical', [], true, 'right'],
      ['three bonds leave top free', [30, 150, 270], false, 'top'],
      [
        'six bonds leave no free quadrant',
        [0, 60, 120, 180, 240, 300],
        false,
        'right',
      ],
      [
        'left is preferred over top when right is taken',
        [10, 80],
        false,
        'left',
      ],
      ['top is preferred over bottom', [0, 180, 270], false, 'top'],
      ['radical with right, left and top bonds', [0, 180, 90], true, 'bottom'],
      [
        'radical with right, left and bottom bonds',
        [0, 180, 270],
        true,
        'right',
      ],
    ];

    it.each(rows)('%s', (_name, angles, hasRadical, expected) => {
      expect(getImplicitHydrogenSide(angles, hasRadical)).toBe(expected);
    });
  });

  describe('quadrant boundaries belong to the quadrant that starts there', () => {
    const rows: Row[] = [
      // 45 is top, so right is free
      ['45 is top, not right', [45, 180], false, 'right'],
      // 135 is left, so right and top are free
      ['135 is left, not top', [135, 0], false, 'top'],
      // 225 is bottom, so left is free
      ['225 is bottom, not left', [225, 0], false, 'left'],
      // 315 is right, so top is free
      ['315 is right, not bottom', [315, 180], false, 'top'],
      ['just below 315 is bottom', [314.99, 180], false, 'right'],
      ['rounded to 315 is right', [314.996, 180], false, 'top'],
      ['-45 normalises to 315', [-45, 180], false, 'top'],
      ['405 normalises to 45', [405, 180], false, 'right'],
      ['360 normalises to 0', [360, 180], false, 'top'],
    ];

    it.each(rows)('%s', (_name, angles, hasRadical, expected) => {
      expect(getImplicitHydrogenSide(angles, hasRadical)).toBe(expected);
    });
  });
});

describe('bondAngleDeg', () => {
  it.each([
    ['right', { x: 1, y: 0 }, 0],
    ['up (model y is down)', { x: 0, y: -1 }, 90],
    ['left', { x: -1, y: 0 }, 180],
    ['down (model y is down)', { x: 0, y: 1 }, 270],
    ['up and right', { x: 1, y: -1 }, 45],
    ['down and right', { x: 1, y: 1 }, 315],
    ['up and left, unnormalised length', { x: -3, y: -3 }, 135],
  ])('%s', (_name, dir, expected) => {
    expect(bondAngleDeg(dir)).toBeCloseTo(expected, 6);
  });
});
