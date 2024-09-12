import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { Vec2 } from 'domain/entities/vec2';
import { BaseMonomer } from 'domain/entities/BaseMonomer';

export class Atom extends DrawingEntity {
  constructor(position: Vec2, public monomer: BaseMonomer) {
    super(position);
  }
}
