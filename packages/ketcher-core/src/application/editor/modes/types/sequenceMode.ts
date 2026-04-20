import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { MonomerItemType } from 'domain/types';
import { IRnaPreset } from 'application/editor/tools/Tool';

export interface SequenceMode {
  readonly isEditMode: boolean;
  readonly isEditInRNABuilderMode: boolean;
  deleteSelection(): void;
  turnOnEditMode(sequenceItemRenderer?: BaseSequenceItemRenderer): void;
  turnOnSequenceEditInRNABuilderMode(): void;
  turnOffSequenceEditInRNABuilderMode(): void;
  turnOnSyncEditMode(): void;
  turnOffSyncEditMode(): void;
  resetEditMode(): void;
  insertMonomerFromLibrary(monomerItem: MonomerItemType): void;
  insertPresetFromLibrary(preset: IRnaPreset): void;
  establishHydrogenBond(sequenceItemRenderer: BaseSequenceItemRenderer): void;
  deleteHydrogenBond(sequenceItemRenderer: BaseSequenceItemRenderer): void;
}
