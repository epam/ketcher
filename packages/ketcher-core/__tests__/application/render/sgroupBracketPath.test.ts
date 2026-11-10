import { Vec2 } from 'domain/entities/vec2';
import { SGroupBracketType } from 'domain/entities/sgroup';
import {
  getSGroupBracketEndpoints,
  getSGroupBracketPath,
} from 'application/render/sgroupBracketPath';

const params = {
  bracketDirection: new Vec2(0, 40),
  bracketAngleDirection: new Vec2(40, 0),
  center: new Vec2(100, 100),
  width: 0.25,
  height: 2,
};

const numbersOf = (path: string) =>
  (path.match(/[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?/g) ?? []).map(
    Number,
  );

describe('S-group bracket path', () => {
  it('should compute the spine and inner ends of the bracket', () => {
    const { point0, point1, arc0, arc1 } = getSGroupBracketEndpoints(params);

    expect(point0).toEqual(new Vec2(100, 60));
    expect(point1).toEqual(new Vec2(100, 140));
    expect(arc0).toEqual(new Vec2(90, 60));
    expect(arc1).toEqual(new Vec2(90, 140));
  });

  it.each([undefined, SGroupBracketType.Square])(
    'should keep the square bracket path unchanged for %s',
    (bracketType) => {
      expect(getSGroupBracketPath(bracketType, params)).toBe(
        'M90,60L100,60L100,140L90,140',
      );
    },
  );

  it('keeps the original rotated square path and its spine endpoints', () => {
    const rotated = {
      ...params,
      bracketDirection: new Vec2(24, 32),
      bracketAngleDirection: new Vec2(32, -24),
    };

    expect(getSGroupBracketPath(SGroupBracketType.Square, rotated)).toBe(
      'M68,74L76,68L124,132L116,138',
    );
    expect(getSGroupBracketEndpoints(rotated)).toEqual(
      expect.objectContaining({
        point0: new Vec2(76, 68),
        point1: new Vec2(124, 132),
      }),
    );
  });

  it('should apply the coordinate formatter', () => {
    expect(
      getSGroupBracketPath(SGroupBracketType.Square, params, (value) =>
        value.toFixed(1),
      ),
    ).toBe('M90.0,60.0L100.0,60.0L100.0,140.0L90.0,140.0');
  });

  it('should draw smooth parentheses through the spine centre', () => {
    const path = getSGroupBracketPath(SGroupBracketType.Round, params);
    const coordinates = numbersOf(path);

    expect(path.startsWith('M90,60C')).toBe(true);
    expect(path.endsWith('90,140')).toBe(true);
    expect(path).not.toContain('L');
    expect(path).toContain(' 100,100C');
    expect(coordinates[2]).toBeCloseTo(96.6666667);
    expect(coordinates[3]).toBeCloseTo(71);
    expect(coordinates[4]).toBeCloseTo(100);
    expect(coordinates[5]).toBeCloseTo(85.5);
  });

  it('should draw curly brackets with the cusp on the spine centre', () => {
    const path = getSGroupBracketPath(SGroupBracketType.Curly, params);

    expect(path.startsWith('M90,60Q')).toBe(true);
    expect(path.endsWith('90,140')).toBe(true);
    expect(path).toContain(' 100,100Q');
    numbersOf(path).forEach((value, index) => {
      if (index % 2 === 0) {
        expect(value).toBeGreaterThanOrEqual(90);
        expect(value).toBeLessThanOrEqual(100);
      }
    });
  });

  it('should mirror the shape for a bracket that faces the other way', () => {
    const mirrored = {
      ...params,
      bracketAngleDirection: new Vec2(-40, 0),
    };

    expect(getSGroupBracketPath(SGroupBracketType.Curly, mirrored)).toContain(
      ' 100,100Q',
    );
    expect(
      getSGroupBracketPath(SGroupBracketType.Round, mirrored).startsWith(
        'M110,60C',
      ),
    ).toBe(true);
  });

  it.each([
    ['round', SGroupBracketType.Round],
    ['curly', SGroupBracketType.Curly],
  ])(
    'keeps all %s control points in the oriented envelope for small and tall brackets',
    (_name, type) => {
      for (const height of [0.03, 20]) {
        for (const side of [-1, 1]) {
          const direction = new Vec2(24, 32);
          const angleDirection = new Vec2(32 * side, -24 * side);
          const rotated = {
            ...params,
            bracketDirection: direction,
            bracketAngleDirection: angleDirection,
            width: 0.25,
            height,
          };
          const coordinates = numbersOf(getSGroupBracketPath(type, rotated));

          expect(coordinates.length).toBeGreaterThan(0);
          expect(coordinates.length % 2).toBe(0);
          for (let index = 0; index < coordinates.length; index += 2) {
            const x = coordinates[index] - rotated.center.x;
            const y = coordinates[index + 1] - rotated.center.y;
            const along = (x * direction.x + y * direction.y) / 1600;
            const outward =
              (x * angleDirection.x + y * angleDirection.y) / 1600;

            expect(Number.isFinite(along)).toBe(true);
            expect(Number.isFinite(outward)).toBe(true);
            expect(along).toBeGreaterThanOrEqual(-height / 2 - 1e-10);
            expect(along).toBeLessThanOrEqual(height / 2 + 1e-10);
            expect(outward).toBeGreaterThanOrEqual(-rotated.width - 1e-10);
            expect(outward).toBeLessThanOrEqual(1e-10);
          }
        }
      }
    },
  );
});
