import type { Vec2 } from 'domain/entities/vec2';

export default class BracketParameters {
  center: Vec2;
  bracketAngleDirection: Vec2;
  bracketDirection: Vec2;
  width: number;
  height: number;
  constructor(
    center: Vec2,
    bracketAngleDirection: Vec2,
    width: number,
    height: number,
    bracketDirection?: Vec2,
  ) {
    this.center = center;
    this.bracketAngleDirection = bracketAngleDirection;
    this.bracketDirection =
      bracketDirection || bracketAngleDirection.rotateSC(1, 0);
    this.width = width;
    this.height = height;
  }
}
