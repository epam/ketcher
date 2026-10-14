import type { CoreEditor } from '../application/editor/Editor';

// The toggler element is UI-framework-specific, so each consumer supplies its type.
export interface MacromoleculesEditorProps<TogglerElement = unknown> {
  ketcherId: string;
  togglerComponent?: TogglerElement;
  isMacromoleculesEditorTurnedOn?: boolean;
  monomersLibraryUpdate?: string | JSON;
  monomersLibraryReplace?: string | JSON;
  onInit?: (editor: CoreEditor) => void;
}
