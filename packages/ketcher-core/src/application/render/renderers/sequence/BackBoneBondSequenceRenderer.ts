import { BaseSequenceRenderer } from 'application/render/renderers/sequence/BaseSequenceRenderer';
import { PolymerBond } from 'domain/entities/PolymerBond';

export class BackBoneBondSequenceRenderer extends BaseSequenceRenderer {
  constructor(polymerBond: PolymerBond) {
    super(polymerBond);
  }

  public get isSnake(): false {
    return false;
  }

  public isMonomersOnSameHorizontalLine(): false {
    return false;
  }

  public moveStart(): void {}

  public moveEnd(): void {}
}
