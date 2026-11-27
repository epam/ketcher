import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { Vec2 } from 'domain/entities/vec2';
import type { initiallySelectedType } from 'domain/entities/BaseMicromoleculeEntity';

export interface CoreTextState {
  content: string;
  position: Vec2;
}

export class CoreText extends DrawingEntity {
  private size_: Vec2 = new Vec2(0, 0);
  public pos: Vec2[] = [];

  constructor(
    public content: string,
    private position_: Vec2,
    public initiallySelected?: initiallySelectedType,
  ) {
    super(new Vec2(position_.x, position_.y));
  }

  public get position(): Vec2 {
    return this.position_;
  }

  public get size(): Vec2 {
    return this.size_;
  }

  public setSize(size: Vec2): void {
    this.size_ = new Vec2(size.x, size.y);
  }

  public get center(): Vec2 {
    return this.position_.add(this.size_.scaled(0.5));
  }

  public getState(): CoreTextState {
    return {
      content: this.content,
      position: new Vec2(this.position_.x, this.position_.y),
    };
  }

  public setState(state: CoreTextState): void {
    this.content = state.content;
    this.position_ = new Vec2(state.position.x, state.position.y);
  }

  public moveRelative(offset: Vec2): void {
    this.position_ = this.position_.add(offset);
  }

  public moveAbsolute(position: Vec2): void {
    this.moveRelative(Vec2.diff(position, this.position_));
  }
}
