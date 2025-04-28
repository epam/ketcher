import BaseOperation from 'application/editor/operations/base';
import { OperationType } from 'application/editor';
import { ReStruct } from 'application/render';
import { MonomerMicromolecule } from 'domain/entities';

type RotateMonomerData = {
  id: number;
  value: number | null;
};

export class RotateMonomerOperation extends BaseOperation {
  private previousValue: number | null = null;

  constructor(public data: RotateMonomerData) {
    super(OperationType.ROTATE_MONOMER);
  }

  execute(restruct: ReStruct) {
    const monomerSGroup = restruct.molecule.sgroups.get(this.data.id);
    if (!monomerSGroup || !(monomerSGroup instanceof MonomerMicromolecule)) {
      return;
    }

    const monomerTransformation =
      (monomerSGroup.monomer.monomerItem.transformation ||= {});
    this.previousValue = monomerTransformation.rotate ?? 0;

    if (this.data.value === null) {
      delete monomerTransformation.rotate;
      return;
    }

    monomerTransformation.rotate = this.previousValue + this.data.value;
  }

  invert() {
    return new RotateMonomerOperation({
      id: this.data.id,
      value: this.previousValue,
    });
  }
}
