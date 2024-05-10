import { BaseSequenceRenderer } from 'application/render/renderers/sequence/BaseSequenceRenderer';
import { PolymerBond } from 'domain/entities/PolymerBond';

export class BackBoneBondSequenceRenderer extends BaseSequenceRenderer {
  constructor(polymerBond: PolymerBond) {
    super(polymerBond);
  }

  public get isSnake() {
    return false;
  }

  public isMonomersOnSameHorizontalLine() {
    return false;
  }

  public moveStart() {}

  public moveEnd() {}
}
