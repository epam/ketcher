import type { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import type { MonomerItemType } from 'domain/types';
import type { IRnaPreset } from 'application/editor/tools/Tool';

export interface SequenceMode {
  readonly isEditMode: boolean;
  readonly isEditInRNABuilderMode: boolean;
  deleteSelection(): void;
  turnOnEditMode(sequenceItemRenderer?: BaseSequenceItemRenderer): void;
<<<<<<< HEAD
  turnOffEditMode(needToRemoveSelection?: boolean): void;
  turnOnSequenceEditInRNABuilderMode(): void;
  turnOffSequenceEditInRNABuilderMode(needToRemoveSelection?: boolean): void;
=======
  turnOffEditMode(shouldRemoveSelection?: boolean): void;
  turnOnSequenceEditInRNABuilderMode(): void;
  turnOffSequenceEditInRNABuilderMode(shouldRemoveSelection?: boolean): void;
>>>>>>> origin/master
  turnOnSyncEditMode(): void;
  turnOffSyncEditMode(): void;
  resetEditMode(): void;
  insertMonomerFromLibrary(monomerItem: MonomerItemType): void;
  insertPresetFromLibrary(preset: IRnaPreset): void;
  establishHydrogenBond(sequenceItemRenderer: BaseSequenceItemRenderer): void;
  deleteHydrogenBond(sequenceItemRenderer: BaseSequenceItemRenderer): void;
}
