import type { CoreEditor } from 'application/editor/Editor';
import type { BaseMode } from 'application/editor/modes/BaseMode';
import type { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import type { Operation } from 'domain/entities/Operation';

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
  sequenceRenderer: Pick<typeof SequenceRenderer, 'show' | 'clear'>;
  createReinitializeModeOperation(): Operation;
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
