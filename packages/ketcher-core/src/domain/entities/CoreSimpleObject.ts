import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { Vec2 } from 'domain/entities/vec2';
import type { initiallySelectedType } from 'domain/entities/BaseMicromoleculeEntity';
import type { SimpleObjectMode } from 'domain/entities/simpleObject';

export class CoreSimpleObject extends DrawingEntity {
  public pos: [Vec2, Vec2];

  constructor(
    public mode: SimpleObjectMode,
    start: Vec2,
    end: Vec2,
    public initiallySelected?: initiallySelectedType,
  ) {
    super(new Vec2(start.x, start.y));
    this.pos = [new Vec2(start.x, start.y), new Vec2(end.x, end.y)];
  }

  public get position(): Vec2 {
    return this.pos[0];
  }

  public get center(): Vec2 {
    return Vec2.centre(this.pos[0], this.pos[1]);
  }

  public moveRelative(offset: Vec2): void {
    this.pos = [this.pos[0].add(offset), this.pos[1].add(offset)];
  }

  public moveAbsolute(position: Vec2): void {
    this.moveRelative(Vec2.diff(position, this.pos[0]));
  }

  public mapPoints(transform: (point: Vec2) => Vec2): [Vec2, Vec2] {
    return [transform(this.pos[0]), transform(this.pos[1])];
  }

  public setPoints(points: [Vec2, Vec2]): void {
    this.pos = [
      new Vec2(points[0].x, points[0].y),
      new Vec2(points[1].x, points[1].y),
    ];
  }
}
