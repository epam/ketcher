import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { Vec2 } from 'domain/entities/vec2';

export class Atom extends DrawingEntity {
  constructor(position: Vec2) {
    super(position);
  }
}