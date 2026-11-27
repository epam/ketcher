import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { Vec2 } from 'domain/entities/vec2';
import type { initiallySelectedType } from 'domain/entities/BaseMicromoleculeEntity';

export interface CoreImageState {
  center: Vec2;
  halfSize: Vec2;
}

export class CoreImage extends DrawingEntity {
  constructor(
    public bitmap: string,
    private center_: Vec2,
    private halfSize: Vec2,
    public initiallySelected?: initiallySelectedType,
  ) {
    super(new Vec2(center_.x - halfSize.x, center_.y - halfSize.y));
  }

  public get position(): Vec2 {
    return this.center_.sub(this.halfSize);
  }

  public get center(): Vec2 {
    return this.center_;
  }

  public get bottomRight(): Vec2 {
    return this.center_.add(this.halfSize);
  }

  public getState(): CoreImageState {
    return {
      center: new Vec2(this.center_.x, this.center_.y),
      halfSize: new Vec2(this.halfSize.x, this.halfSize.y),
    };
  }

  public setState(state: CoreImageState): void {
    this.center_ = new Vec2(state.center.x, state.center.y);
    this.halfSize = new Vec2(state.halfSize.x, state.halfSize.y);
  }

  public moveRelative(offset: Vec2): void {
    this.center_ = this.center_.add(offset);
  }

  public moveAbsolute(position: Vec2): void {
    this.moveRelative(Vec2.diff(position, this.position));
  }

  public static stateFromCorners(
    topLeft: Vec2,
    bottomRight: Vec2,
  ): CoreImageState {
    const half = Vec2.diff(bottomRight, topLeft).scaled(0.5);
    return {
      center: Vec2.centre(topLeft, bottomRight),
      halfSize: new Vec2(Math.abs(half.x), Math.abs(half.y)),
    };
  }

  public resize(topLeft: Vec2, bottomRight: Vec2): void {
    this.setState(CoreImage.stateFromCorners(topLeft, bottomRight));
  }
}
