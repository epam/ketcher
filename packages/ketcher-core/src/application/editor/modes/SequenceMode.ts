import { CoreEditor, EditorHistory } from 'application/editor/internal';
import { LayoutMode } from 'application/editor/modes';
import { BaseMode } from 'application/editor/modes/BaseMode';
import ZoomTool from 'application/editor/tools/Zoom';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import { initHotKeys, keyNorm } from 'utilities';
import { AttachmentPointName } from 'domain/types';
import { Command } from 'domain/entities/Command';
import { Phosphate, Sugar, Vec2 } from 'domain/entities';
import { RenderersManager } from 'application/render/renderers/RenderersManager';
import { BaseRenderer } from 'application/render';
import { EmptySequenceNode } from 'domain/entities/EmptySequenceNode';

export class SequenceMode extends BaseMode {
  private _isEditMode = false;
  constructor(previousMode?: LayoutMode) {
    super('sequence-layout-mode', previousMode);
  }

  public get isEditMode() {
    return this._isEditMode;
  }

  public set isEditMode(isEditMode) {
    this._isEditMode = isEditMode;
  }

  public initialize(needScroll = true) {
    const command = super.initialize();
    const editor = CoreEditor.provideEditorInstance();

    editor.drawingEntitiesManager.applyFlexLayoutMode();

    const modelChanges = editor.drawingEntitiesManager.reArrangeChains(
      editor.canvas.width.baseVal.value,
      true,
    );
    const zoom = ZoomTool.instance;

    editor.renderersContainer.update(modelChanges);

    const chainsCollection =
      editor.drawingEntitiesManager.applyMonomersSequenceLayout();
    const firstMonomerPosition =
      chainsCollection.firstNode?.monomer.renderer?.scaledMonomerPosition;

    if (firstMonomerPosition && needScroll) {
      zoom.scrollTo(firstMonomerPosition);
    }

    const turnOffSelectionCommand =
      editor?.drawingEntitiesManager.unselectAllDrawingEntities();
    editor?.renderersContainer.update(turnOffSelectionCommand);

    modelChanges.merge(command);

    editor.events.selectTool.dispatch('select-rectangle');

    return modelChanges;
  }

  public turnOnEditMode(sequenceItemRenderer?: BaseSequenceItemRenderer) {
    if (sequenceItemRenderer) {
      SequenceRenderer.setCaretPositionBySequenceItemRenderer(
        sequenceItemRenderer,
      );
      SequenceRenderer.moveCaretForward();
    }

    this.isEditMode = true;
    this.initialize(false);
  }

  public onKeyUp(event: KeyboardEvent) {
    const hotKeys = initHotKeys(this.keyboardEventHandlers);
    const shortcutKey = keyNorm.lookup(hotKeys, event);

    this.keyboardEventHandlers[shortcutKey]?.handler(event);
  }

  public click(event: MouseEvent) {
    const isClickedOnEmptyPlace = !(
      event?.target.__data__ instanceof BaseRenderer
    );
    const editor = CoreEditor.provideEditorInstance();

    if (isClickedOnEmptyPlace) {
      if (!this.isEditMode) {
        this.turnOnEditMode();
      }

      SequenceRenderer.startNewSequence();
      SequenceRenderer.moveCaretToNewChain();
    }
  }

  private get keyboardEventHandlers() {
    return {
      delete: {
        shortcut: ['Backspace', 'Escape'],
        handler: () => {
          const editor = CoreEditor.provideEditorInstance();
          const history = new EditorHistory(editor);
          const previousNode =
            SequenceRenderer.previousFromCurrentEdittingMonomer;
          const currentNode = SequenceRenderer.currentEdittingNode;
          const nextNode = SequenceRenderer.nextFromCurrentEdittingMonomer;
          const modelChanges = new Command();

          if (previousNode) {
            currentNode?.monomers.forEach((monomer) => {
              modelChanges.merge(
                editor.drawingEntitiesManager.deleteMonomer(monomer),
              );
            });
            modelChanges.merge(
              editor.drawingEntitiesManager.createPolymerBond(
                previousNode?.lastMonomerInNode,
                nextNode?.firstMonomerInNode,
                AttachmentPointName.R2,
                AttachmentPointName.R1,
              ),
            );
          } else {
            modelChanges.merge(
              editor.drawingEntitiesManager.createPolymerBond(
                previousNode?.lastMonomerInNode,
                currentNode?.firstMonomerInNode,
                AttachmentPointName.R2,
                AttachmentPointName.R1,
              ),
            );
          }

          editor.renderersContainer.update(modelChanges);
          history.update(modelChanges);
          SequenceRenderer.setCaretPositionBySequenceItemRenderer(
            previousNode?.monomer.renderer,
          );
          this.initialize(false);
        },
      },
      'move-caret-forward': {
        shortcut: ['ArrowRight'],
        handler: () => {
          SequenceRenderer.moveCaretForward();
        },
      },
      'move-caret-back': {
        shortcut: ['ArrowLeft'],
        handler: () => {
          SequenceRenderer.moveCaretBack();
        },
      },
      'add-sequence-item': {
        shortcut: ['A', 'T', 'G', 'C', 'U', 'a', 't', 'g', 'c', 'u'],
        handler: (event) => {
          const editor = CoreEditor.provideEditorInstance();
          const history = new EditorHistory(editor);
          const currentNode = SequenceRenderer.currentEdittingNode;
          const previousNode = SequenceRenderer.previousNodeInSameChain;
          const nextNode = SequenceRenderer.nextNodeInSameChain;
          const modelChanges = new Command();

          const rnaBaseLibraryItem = editor.monomersLibrary.RNA.find(
            (libraryItem) =>
              libraryItem.props.MonomerName === event.key.toUpperCase(),
          );
          const sugarLibraryItem = editor.monomersLibrary.RNA.find(
            (libraryItem) => libraryItem.props.MonomerName === 'R',
          );
          const phosphateLibraryItem = editor.monomersLibrary.RNA.find(
            (libraryItem) => libraryItem.props.MonomerName === 'P',
          );

          const { command, monomers } =
            editor.drawingEntitiesManager.addRnaPreset({
              sugar: sugarLibraryItem,
              sugarPosition: new Vec2(0, 0),
              rnaBase: rnaBaseLibraryItem,
              rnaBasePosition: new Vec2(0, 0),
              phosphate: phosphateLibraryItem,
              phosphatePosition: new Vec2(0, 0),
            });

          modelChanges.merge(command);

          const sugar = monomers.find((monomer) => monomer instanceof Sugar);
          const phosphate = monomers.find(
            (monomer) => monomer instanceof Phosphate,
          );

          if (!(currentNode instanceof EmptySequenceNode)) {
            modelChanges.merge(
              editor.drawingEntitiesManager.createPolymerBond(
                phosphate,
                currentNode?.firstMonomerInNode,
                AttachmentPointName.R2,
                AttachmentPointName.R1,
              ),
            );

            if (previousNode) {
              modelChanges.merge(
                editor.drawingEntitiesManager.deletePolymerBond(
                  previousNode?.lastMonomerInNode.attachmentPointsToBonds.R2,
                ),
              );
            }
          }

          if (previousNode) {
            modelChanges.merge(
              editor.drawingEntitiesManager.createPolymerBond(
                previousNode.lastMonomerInNode,
                sugar,
                AttachmentPointName.R2,
                AttachmentPointName.R1,
              ),
            );
          }

          editor.renderersContainer.update(modelChanges);
          history.update(modelChanges);
          this.initialize(false);
          SequenceRenderer.moveCaretForward();
        },
      },
    };
  }
}
