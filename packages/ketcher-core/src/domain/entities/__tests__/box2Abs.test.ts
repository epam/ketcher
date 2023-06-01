import { Vec2 } from 'domain/entities/vec2'
import { Box2Abs } from 'domain/entities/box2Abs'

describe('Box2Abs', () => {
  describe('segmentIntersection', () => {
    const testData: [Vec2, Vec2, Vec2, Vec2, boolean][] = [
      // On the same ray
      [new Vec2(0, 0), new Vec2(0, 0), new Vec2(0, 0), new Vec2(0, 0), true],
      [new Vec2(0, 0), new Vec2(1, 1), new Vec2(0, 0), new Vec2(1, 1), true],
      [new Vec2(0, 0), new Vec2(10, 10), new Vec2(2, 2), new Vec2(3, 3), true],
      [new Vec2(2, 2), new Vec2(3, 3), new Vec2(0, 0), new Vec2(10, 10), true],
      [new Vec2(0, 0), new Vec2(5, 5), new Vec2(4, 4), new Vec2(6, 6), true],
      [new Vec2(4, 4), new Vec2(6, 6), new Vec2(0, 0), new Vec2(5, 5), true],
      // Touch (is not considered as intersection)
      [new Vec2(3, 3), new Vec2(6, 3), new Vec2(1, 1), new Vec2(4, 3), false],
      // Crossing
      [new Vec2(1, 1), new Vec2(4, 3), new Vec2(2, 3), new Vec2(4, 1), true],
      [new Vec2(3, 3), new Vec2(6, 3), new Vec2(1, 1), new Vec2(5, 4), true],
      // Not crossing
      [new Vec2(2, 2), new Vec2(3, 3), new Vec2(5, 2), new Vec2(7, 3), false],
      [new Vec2(5, 2), new Vec2(7, 3), new Vec2(2, 2), new Vec2(3, 3), false],
      // Collinear segments
      [new Vec2(2, 2), new Vec2(3, 3), new Vec2(5, 5), new Vec2(7, 7), false],
      [new Vec2(2, 2), new Vec2(5, 5), new Vec2(5, 5), new Vec2(7, 7), true],
      [new Vec2(5, 5), new Vec2(7, 7), new Vec2(2, 2), new Vec2(5, 5), true],
      [new Vec2(2, 2), new Vec2(3, 2), new Vec2(5, 2), new Vec2(7, 2), false],
      [new Vec2(2, 2), new Vec2(3, 2), new Vec2(3, 2), new Vec2(7, 2), true],
      [new Vec2(5, 2), new Vec2(7, 2), new Vec2(2, 2), new Vec2(5, 2), true],
      // Common point (is not considering as intersection)
      [new Vec2(2, 3), new Vec2(4, 1), new Vec2(4, 1), new Vec2(5, 2), false]
    ]
    it.each(testData)(
      'Should detect intersection of two segments',
      (
        seg1TopLeft,
        seg1BottomRight,
        seg2TopLeft,
        seg2BottomRight,
        expectedResult
      ) => {
        const result = Box2Abs.segmentIntersection(
          seg1TopLeft,
          seg1BottomRight,
          seg2TopLeft,
          seg2BottomRight
        )
        expect(result).toBe(expectedResult)
      }
    )
  })
})
