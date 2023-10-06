import { ChangeEvent } from 'react';

export interface IRnaEditorExpandedProps {
  name?: string;
  isEditMode: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onChangeName: (event: ChangeEvent<HTMLInputElement>) => void;
  onDuplicate: () => void;
}
