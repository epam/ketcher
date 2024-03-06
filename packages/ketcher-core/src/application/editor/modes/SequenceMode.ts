import { CoreEditor, EditorHistory } from 'application/editor/internal';
import { LayoutMode } from 'application/editor/modes';
import { BaseMode } from 'application/editor/modes/BaseMode';
import ZoomTool from 'application/editor/tools/Zoom';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import { initHotKeys, keyNorm } from 'utilities';
import { AttachmentPointName, MonomerItemType } from 'domain/types';
import { Command } from 'domain/entities/Command';
import { BaseMonomer, Phosphate, Sugar, Vec2 } from 'domain/entities';
import { RenderersManager } from 'application/render/renderers/RenderersManager';
import { BaseRenderer } from 'application/render';
import { EmptySequenceNode } from 'domain/entities/EmptySequenceNode';
import { Nucleoside } from 'domain/entities/Nucleoside';
import { Nucleotide } from 'domain/entities/Nucleotide';

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

    editor.drawingEntitiesManager.clearCanvas();

    const modelChanges = editor.drawingEntitiesManager.reArrangeChains(
      editor.canvas.width.baseVal.value,
      true,
      false,
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

    modelChanges.merge(command);

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

  public turnOffEditMode() {
    if (!this.isEditMode) return;

    this.isEditMode = false;
    this.initialize(false);
  }

  public onKeyUp(event: KeyboardEvent) {
    if (!this.isEditMode) {
      return;
    }
    const hotKeys = initHotKeys(this.keyboardEventHandlers);
    const shortcutKey = keyNorm.lookup(hotKeys, event);

    this.keyboardEventHandlers[shortcutKey]?.handler(event);
  }

  public startNewSequence() {
    if (!this.isEditMode) {
      this.turnOnEditMode();
    }

    if (!SequenceRenderer.hasNewChain) {
      SequenceRenderer.startNewSequence();
    }

    SequenceRenderer.moveCaretToNewChain();
  }

  public click(event: MouseEvent) {
    const eventData = event?.target.__data__;
    const isClickedOnEmptyPlace = !(eventData instanceof BaseRenderer);
    const isClickedOnSequenceItem =
      eventData instanceof BaseSequenceItemRenderer;

    if (isClickedOnEmptyPlace) {
      this.turnOffEditMode();
    } else if (this.isEditMode && isClickedOnSequenceItem) {
      SequenceRenderer.setCaretPositionBySequenceItemRenderer(eventData);
    }
  }

  private get keyboardEventHandlers() {
    return {
      delete: {
        shortcut: ['Backspace', 'Delete'],
        handler: () => {
          const editor = CoreEditor.provideEditorInstance();
          const history = new EditorHistory(editor);
          const previousNode =
            SequenceRenderer.previousFromCurrentEdittingMonomer;
          const previousNodeInSameChain =
            SequenceRenderer.previousNodeInSameChain;
          const bondBeforePreviousNode =
            previousNode?.firstMonomerInNode?.attachmentPointsToBonds.R1;
          const monomerBeforePreviousNode =
            bondBeforePreviousNode?.getAnotherMonomer(bondBeforePreviousNode);
          const currentNode = SequenceRenderer.currentEdittingNode;
          const modelChanges = new Command();

          if (previousNodeInSameChain) {
            previousNode?.monomers.forEach((monomer) => {
              modelChanges.merge(
                editor.drawingEntitiesManager.deleteMonomer(monomer),
              );
            });

            const nodeBeforePreviousNode =
              SequenceRenderer.getPreviousNodeInSameChain(previousNode);

            if (nodeBeforePreviousNode) {
              if (previousNode instanceof Nucleoside) {
                // delete phosphate from last nucleotide
                modelChanges.merge(
                  editor.drawingEntitiesManager.deleteMonomer(
                    nodeBeforePreviousNode?.lastMonomerInNode,
                  ),
                );
              }
              if (!(currentNode instanceof EmptySequenceNode)) {
                modelChanges.merge(
                  editor.drawingEntitiesManager.createPolymerBond(
                    previousNode instanceof Nucleoside
                      ? nodeBeforePreviousNode.firstMonomerInNode
                      : monomerBeforePreviousNode,
                    currentNode?.firstMonomerInNode,
                    AttachmentPointName.R2,
                    AttachmentPointName.R1,
                  ),
                );
                SequenceRenderer.moveCaretBack();
              }
            }
          } else if (SequenceRenderer.previousChain) {
            const previousChainLastNonEmptyNode =
              SequenceRenderer.getLastNonEmptyNode(
                SequenceRenderer.previousChain,
              );

            modelChanges.merge(
              editor.drawingEntitiesManager.createPolymerBond(
                previousChainLastNonEmptyNode?.lastMonomerInNode,
                currentNode?.firstMonomerInNode,
                AttachmentPointName.R2,
                AttachmentPointName.R1,
              ),
            );
            SequenceRenderer.moveCaretBack();
            SequenceRenderer.moveCaretBack();
          }

          editor.renderersContainer.update(modelChanges);
          history.update(modelChanges);
          this.initialize(false);
        },
      },
      'turn-off-edit-mode': {
        shortcut: ['Escape'],
        handler: () => {
          this.turnOffEditMode();
        },
      },
      'start-new-sequence': {
        shortcut: ['Enter'],
        handler: () => {
          this.startNewSequence();
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
          const modelChanges = new Command();

          const rightBottomPosition =
            currentNode?.firstMonomerInNode?.position || new Vec2(9999, 9999);
          const nodeToAdd =
            currentNode instanceof Nucleotide ||
            currentNode instanceof Nucleoside
              ? Nucleotide.createOnCanvas(
                  event.key.toUpperCase(),
                  rightBottomPosition,
                )
              : Nucleoside.createOnCanvas(
                  event.key.toUpperCase(),
                  rightBottomPosition,
                );

          if (!(currentNode instanceof EmptySequenceNode)) {
            modelChanges.merge(
              editor.drawingEntitiesManager.createPolymerBond(
                nodeToAdd.lastMonomerInNode,
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

          if (previousNode instanceof Nucleoside) {
            const phosphateLibraryItem = editor.monomersLibrary.RNA.find(
              (libraryItem) => libraryItem.props.MonomerName === 'P',
            ) as MonomerItemType;

            const additionalPhosphateAddCommand =
              editor.drawingEntitiesManager.addMonomer(
                phosphateLibraryItem,
                rightBottomPosition,
              );
            const additionalPhosphate = additionalPhosphateAddCommand
              .operations[0].monomer as BaseMonomer;
            modelChanges.merge(additionalPhosphateAddCommand);

            modelChanges.merge(
              editor.drawingEntitiesManager.createPolymerBond(
                previousNode.lastMonomerInNode,
                additionalPhosphate,
                AttachmentPointName.R2,
                AttachmentPointName.R1,
              ),
            );

            modelChanges.merge(
              editor.drawingEntitiesManager.createPolymerBond(
                additionalPhosphate,
                nodeToAdd.firstMonomerInNode,
                AttachmentPointName.R2,
                AttachmentPointName.R1,
              ),
            );
          } else if (previousNode) {
            modelChanges.merge(
              editor.drawingEntitiesManager.createPolymerBond(
                previousNode.lastMonomerInNode,
                nodeToAdd.firstMonomerInNode,
                AttachmentPointName.R2,
                AttachmentPointName.R1,
              ),
            );
          }

          editor.renderersContainer.update(modelChanges);
          history.update(modelChanges);
          this.initialize(false);
          if (!(currentNode instanceof EmptySequenceNode)) {
            SequenceRenderer.moveCaretForward();
          }
        },
      },
    };
  }
}
