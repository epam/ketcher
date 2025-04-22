import BaseOperation from 'application/editor/operations/base';
import { OperationType } from 'application/editor';
import { ReStruct } from 'application/render';
import { MonomerMicromolecule } from 'domain/entities';

type MonomerTransformPayload =
  | { type: 'rotation'; value: number }
  | { type: 'flip'; value: 'horizontal' | 'vertical' }
  | { type: 'shift'; value: { x: number; y: number } };

type MonomerTransformData = MonomerTransformPayload & { id: number };

export class MonomerTransform extends BaseOperation {
  private previousData: MonomerTransformData | null = null;

  constructor(public data: MonomerTransformData) {
    super(OperationType.MONOMER_TRANSFORM);
  }

  execute(restruct: ReStruct) {
    const monomerSGroup = restruct.molecule.sgroups.get(this.data.id);
    if (!monomerSGroup || !(monomerSGroup instanceof MonomerMicromolecule)) {
      return;
    }

    if (!monomerSGroup.monomer.monomerItem.transformation) {
      monomerSGroup.monomer.monomerItem.transformation = {};
    }

    this.previousData = {
      id: this.data.id,
      type: this.data.type,
      value: monomerSGroup.monomer.monomerItem.transformation[this.data.type],
    };

    monomerSGroup.monomer.monomerItem.transformation[this.data.type] =
      this.data.value;
  }

  invert() {
    if (!this.previousData) {
      throw new Error(
        `${OperationType.MONOMER_TRANSFORM} inverting failed: No data to invert`,
      );
    }

    return new MonomerTransform({
      ...this.previousData,
    });
  }
}
