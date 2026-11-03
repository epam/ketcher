import type {
  DrawingEntitiesManagerDeps,
  EditorPort,
} from 'domain/entities/EditorPort';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import type { CoreEditor } from './Editor';
import { provideEditorSettings } from './editorSettings';
import { ReinitializeModeOperation } from './operations/modes';

export function createEditorPort(editor: CoreEditor): EditorPort {
  return {
    get events() {
      return editor.events;
    },
    get mode() {
      return editor.mode;
    },
    get canvasWidth() {
      return editor.canvas.width.baseVal.value;
    },
    get macroModeScale() {
      return provideEditorSettings().macroModeScale;
    },
    get canvasOffset() {
      return editor.canvasOffset;
    },
    get viewModel() {
      return editor.viewModel;
    },
    get renderersContainer() {
      return editor.renderersContainer;
    },
    get monomersLibrary() {
      return editor.monomersLibrary;
    },
    // The class itself: its static methods use `this`.
    get sequenceRenderer() {
      return SequenceRenderer;
    },
    createReinitializeModeOperation() {
      return new ReinitializeModeOperation();
    },
  };
}

// Managers created by an editor read it through the port. After the editor is
// disposed they behave as managers without an editor.
export function createManagerDeps(
  editor: CoreEditor,
  isDisposed: () => boolean,
): DrawingEntitiesManagerDeps {
  const port = createEditorPort(editor);

  return {
    get editor() {
      return isDisposed() ? undefined : port;
    },
  };
}
