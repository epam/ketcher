import { Bond } from './bond';
import { initiallySelectedType } from 'domain/entities/BaseMicromoleculeEntity';

export interface HapticBondAttributes {
  begin: number;
  sapId: number;
  initiallySelected?: initiallySelectedType;
}

export class HapticBond extends Bond {
  sapId: number;

  constructor(attributes: HapticBondAttributes) {
    super({
      begin: attributes.begin,
      end: -1, // Haptic bonds are not connected to a second atom
      type: Bond.PATTERN.TYPE.HAPTIC,
      initiallySelected: attributes.initiallySelected,
    });
    this.sapId = attributes.sapId;
  }

  get atomId() {
    return this.begin;
  }

  clone(aidMap?: Map<number, number> | null): HapticBond {
    const cp = new HapticBond({ begin: this.begin, sapId: this.sapId });
    if (aidMap) {
      const remapped = aidMap.get(cp.begin);
      if (remapped !== undefined) cp.begin = remapped;
    }
    return cp;
  }

  isHaptic(): boolean {
    return this.type === Bond.PATTERN.TYPE.HAPTIC;
  }
}
