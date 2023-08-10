import { DrawingEntity } from './DrawingEntity';
import { Vec2 } from 'domain/entities/vec2';
import { MonomerItemType } from 'domain/types';

let id = 1;
export class Peptide extends DrawingEntity {
  public id = 0;
  constructor(private _monomerItem: MonomerItemType, _position?: Vec2) {
    super(_position);
    this.id = id;
    id++;
  }

  get monomerItem() {
    return this._monomerItem;
  }

  get label() {
    return this.monomerItem.label;
  }
}
