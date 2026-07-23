import { IRnaPreset } from '../../types';

export interface IRnaEditorExpandedProps {
  isEditMode: boolean;
  onDuplicate: (preset: IRnaPreset) => void;
}
