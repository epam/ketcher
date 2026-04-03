import { IEditorEvents } from 'application/editor/editorEvents';
import { BaseMode } from 'application/editor/modes/internal';
import { BaseTool, Tool } from 'application/editor/tools/Tool';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { SequenceType } from 'domain/entities/monomer-chains/types';
import { Vec2 } from 'domain/entities/vec2';
import { RenderersManagerBase } from 'application/render/renderers/RenderersManagerBase';
import { MonomerItemType } from 'domain/types';
import { ViewModel } from 'application/render/view-model/ViewModel';

export abstract class CoreEditorBase {
  abstract events: IEditorEvents;
  abstract canvas: SVGSVGElement;
  abstract mode: BaseMode;
  abstract viewModel: ViewModel;
  abstract drawingEntitiesManager: DrawingEntitiesManager;
  abstract renderersContainer: RenderersManagerBase;
  abstract canvasOffset: DOMRect;
  abstract lastCursorPosition: Vec2;
  abstract lastCursorPositionOfCanvas: Vec2;

  abstract get selectedTool(): Tool | BaseTool | undefined;
  abstract get isSequenceEditMode(): boolean;
  abstract get isSequenceEditInRNABuilderMode(): boolean;
  abstract get isSequenceAnyEditMode(): boolean;
  abstract get isSequenceMode(): boolean;
  abstract sequenceTypeEnterMode: SequenceType;
  abstract get monomersLibrary(): MonomerItemType[];
  abstract ketcherId?: string;
  abstract scrollToTopLeftCorner(): void;
  abstract setMode(mode: BaseMode): void;
  abstract zoomToStructuresIfNeeded(): void;
  abstract calculateAndStoreNextAutochainPosition(
    drawingEntitiesManagerOrMonomer: DrawingEntitiesManager | BaseMonomer,
  ): void;

  static provideEditorInstance(): CoreEditorBase {
    return editorInstance as CoreEditorBase;
  }

  static setEditorInstance(editor: CoreEditorBase): void {
    editorInstance = editor;
  }

  static resetEditorInstance(): void {
    editorInstance = undefined;
  }
}

let editorInstance: CoreEditorBase | undefined;
