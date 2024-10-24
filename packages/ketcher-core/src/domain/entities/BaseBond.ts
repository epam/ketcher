import { DrawingEntity } from './DrawingEntity';
import { Vec2 } from 'domain/entities/vec2';

export abstract class BaseBond extends DrawingEntity {
  public endPosition: Vec2 = new Vec2();

  abstract get firstEndEntity(): DrawingEntity;
  abstract get secondEndEntity(): DrawingEntity | undefined;

  public get finished() {
    return Boolean(this.firstEndEntity && this.secondEndEntity);
  }

  public get center() {
    return Vec2.centre(this.startPosition, this.endPosition);
  }

  public moveToLinkedEntities() {
    const firstMonomerCenter = this.firstEndEntity.position;
    const secondMonomerCenter = this.secondEndEntity?.position;
    this.moveBondStartAbsolute(firstMonomerCenter.x, firstMonomerCenter.y);
    if (secondMonomerCenter) {
      this.moveBondEndAbsolute(secondMonomerCenter.x, secondMonomerCenter.y);
    }
  }

  public moveBondStartAbsolute(x, y) {
    this.moveAbsolute(new Vec2(x, y));
  }

  public moveBondEndAbsolute(x, y) {
    this.endPosition = new Vec2(x, y);
  }

  public get startPosition() {
    return this.position;
  }

  public getAnotherEntity(monomer: DrawingEntity): DrawingEntity | undefined {
    return this.firstEndEntity === monomer
      ? this.secondEndEntity
      : this.firstEndEntity;
  }
}
