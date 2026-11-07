import type { CoreEditor } from 'application/editor/Editor';
import type { BaseMode } from 'application/editor/modes/BaseMode';

export type Viewport = { readonly width: number; readonly height: number };

// What a DrawingEntitiesManager needs from the editor that owns it. Every
// member is read live on each call and never cached.
export interface EditorPort {
  events: Pick<CoreEditor['events'], 'selectEntities' | 'error'>;
  mode: Pick<BaseMode, 'modeName'>;
  canvasWidth: number;
  macroModeScale: number;
  canvasOffset: Viewport;
  viewModel: Pick<CoreEditor['viewModel'], 'initialize'>;
  renderersContainer: CoreEditor['renderersContainer'];
  monomersLibrary: CoreEditor['monomersLibrary'];
}

export type DrawingEntitiesManagerDeps = { readonly editor?: EditorPort };

export class MissingEditorError extends Error {
  constructor(method: string) {
    super(
      `${method} needs an editor, but this DrawingEntitiesManager has none`,
    );
    this.name = 'MissingEditorError';
  }
}
