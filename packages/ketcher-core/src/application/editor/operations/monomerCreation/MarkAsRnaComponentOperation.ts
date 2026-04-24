import { BaseOperation } from 'application/editor/operations/BaseOperation';
import { MonomerCreationState, RnaComponentAtoms } from 'application/render';
import { OperationType } from 'application/editor/operations/OperationType';
import {
  ComponentStructureUpdateData,
  MonomerCreationComponentStructureUpdateEvent,
  RnaPresetComponentKey,
} from 'application/editor/shared/customEvents';
import assert from 'assert';

export class MarkAsRnaComponentOperation extends BaseOperation {
  constructor(
    private readonly monomerCreationState: MonomerCreationState,
    private readonly componentKey: RnaPresetComponentKey,
    private readonly newAtomIds: number[],
    private readonly newBondIds: number[],
    private readonly prevAtomIds: number[],
    private readonly prevBondIds: number[],
  ) {
    super(OperationType.MONOMER_CREATION_MARK_RNA_COMPONENT);
  }

  execute(): void {
    assert(this.monomerCreationState);

    if (!this.monomerCreationState.rnaComponentAtoms) {
      this.monomerCreationState.rnaComponentAtoms =
        new Map() as RnaComponentAtoms;
    }

    this.monomerCreationState.rnaComponentAtoms.set(this.componentKey, {
      atoms: [...this.newAtomIds],
      bonds: [...this.newBondIds],
    });

    const eventData: ComponentStructureUpdateData = {
      componentKey: this.componentKey,
      atomIds: this.newAtomIds,
      bondIds: this.newBondIds,
    };
    window.dispatchEvent(
      new CustomEvent(MonomerCreationComponentStructureUpdateEvent, {
        detail: eventData,
      }),
    );
  }

  invert(): BaseOperation {
    return new MarkAsRnaComponentOperation(
      this.monomerCreationState,
      this.componentKey,
      this.prevAtomIds,
      this.prevBondIds,
      this.newAtomIds,
      this.newBondIds,
    );
  }
}
