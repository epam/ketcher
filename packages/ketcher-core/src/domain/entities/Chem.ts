import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Peptide } from 'domain/entities/Peptide';

export class Chem extends BaseMonomer {
  public getValidSourcePoint(monomer?: BaseMonomer) {
    return Peptide.prototype.getValidSourcePoint.call(this, monomer);
  }

  public getValidTargetPoint(monomer: BaseMonomer) {
    return Peptide.prototype.getValidTargetPoint.call(this, monomer);
  }
}
