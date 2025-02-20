import { BondSnapView } from 'application/render/renderers/BondSnapView';
import { PolymerBond } from 'domain/entities';

export class TransientDrawingView {
  constructor() {}

  public showBondSnapping(bond: PolymerBond) {
    const bondSnap = new BondSnapView(bond);
    bondSnap.show();
  }
}
