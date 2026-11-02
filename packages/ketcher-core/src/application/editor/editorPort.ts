import type { EditorPort } from 'domain/entities/EditorPort';
import type { CoreEditor } from './Editor';
import { provideEditorSettings } from './editorSettings';

export function createEditorPort(getEditor: () => CoreEditor): EditorPort {
  return {
    get events() {
      return getEditor().events;
    },
    get mode() {
      return getEditor().mode;
    },
    get canvasWidth() {
      return getEditor().canvas.width.baseVal.value;
    },
    get macroModeScale() {
      return provideEditorSettings().macroModeScale;
    },
    get canvasOffset() {
      return getEditor().canvasOffset;
    },
    get viewModel() {
      return getEditor().viewModel;
    },
    get renderersContainer() {
      return getEditor().renderersContainer;
    },
    get monomersLibrary() {
      return getEditor().monomersLibrary;
    },
  };
}
