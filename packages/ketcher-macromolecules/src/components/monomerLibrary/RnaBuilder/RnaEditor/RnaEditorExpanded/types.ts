import { IRnaPreset } from '../../types';

export interface IRnaEditorExpandedProperties {
  isEditMode: boolean;
  onDuplicate: (preset: IRnaPreset) => void;
}
