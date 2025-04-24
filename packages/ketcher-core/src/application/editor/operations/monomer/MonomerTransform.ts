import BaseOperation from 'application/editor/operations/base';
import { OperationType } from 'application/editor';
import { ReStruct } from 'application/render';
import { MonomerMicromolecule } from 'domain/entities';

type MonomerTransformPayload =
  | { type: 'rotate'; value: number }
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

    const monomerTransformation =
      (monomerSGroup.monomer.monomerItem.transformation ||= {});

    if (this.data.type === 'flip') {
      const previousFlip = monomerTransformation.flip;
      const newFlip = this.data.value;

      if (previousFlip && previousFlip !== newFlip) {
        const previousRotation = monomerTransformation.rotate ?? 0;
        delete monomerTransformation.flip;
        monomerTransformation.rotate = previousRotation + Math.PI;
        return;
      }
    }

    this.previousData = {
      id: this.data.id,
      type: this.data.type,
      value: monomerTransformation[this.data.type],
    };

    monomerTransformation[this.data.type] = this.data.value;
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
