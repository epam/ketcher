import BaseOperation from 'application/editor/operations/base';
import { OperationType } from 'application/editor';
import { ReStruct } from 'application/render';
import { MonomerMicromolecule } from 'domain/entities';

type ShiftMonomerData = {
  id: number;
  value: Partial<{
    x: number;
    y: number;
  }> | null;
};

export class ShiftMonomerOperation extends BaseOperation {
  private previousValue: Partial<{ x: number; y: number }> | null = null;

  constructor(public data: ShiftMonomerData) {
    super(OperationType.SHIFT_MONOMER);
  }

  execute(restruct: ReStruct) {
    const monomerSGroup = restruct.molecule.sgroups.get(this.data.id);
    if (!monomerSGroup || !(monomerSGroup instanceof MonomerMicromolecule)) {
      return;
    }

    const monomerTransformation =
      (monomerSGroup.monomer.monomerItem.transformation ||= {});
    this.previousValue = monomerTransformation.shift ?? null;

    if (this.data.value === null) {
      delete monomerTransformation.shift;
      return;
    }

    if (this.data.value) {
      monomerTransformation.shift = {
        x: (this.previousValue?.x ?? 0) + (this.data.value.x ?? 0),
        y: (this.previousValue?.y ?? 0) + (this.data.value.y ?? 0),
      };
    }
  }

  invert() {
    return new ShiftMonomerOperation({
      id: this.data.id,
      value: this.previousValue,
    });
  }
}
