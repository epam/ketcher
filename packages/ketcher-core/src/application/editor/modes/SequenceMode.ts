import { CoreEditor, EditorHistory } from 'application/editor/internal';
import { LayoutMode } from 'application/editor/modes';
import { BaseMode } from 'application/editor/modes/BaseMode';
import ZoomTool from 'application/editor/tools/Zoom';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import { initHotKeys, keyNorm } from 'utilities';
import { AttachmentPointName } from 'domain/types';
import { Command } from 'domain/entities/Command';
import { BaseMonomer, Vec2 } from 'domain/entities';
import { BaseRenderer } from 'application/render';
import { EmptySequenceNode } from 'domain/entities/EmptySequenceNode';
import { Nucleoside } from 'domain/entities/Nucleoside';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { ReinitializeSequenceModeCommand } from 'application/editor/operations/modes';
import assert from 'assert';
import { getRnaPartLibraryItem } from 'domain/helpers/rna';
import { RNA_NON_MODIFIED_PART } from 'domain/constants/monomers';
import { SubChainNode } from 'domain/entities/monomer-chains/types';

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
    const eventData = event.target?.__data__;
    const isClickedOnEmptyPlace = !(eventData instanceof BaseRenderer);
    const isClickedOnSequenceItem =
      eventData instanceof BaseSequenceItemRenderer;

    if (isClickedOnEmptyPlace) {
      this.turnOffEditMode();
    }

    if (this.isEditMode && isClickedOnSequenceItem) {
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
          const currentNode = SequenceRenderer.currentEdittingNode;
          const modelChanges = new Command();

          if (previousNodeInSameChain) {
            // delete all monomers and it's bonds from previous node
            previousNode?.monomers.forEach((monomer) => {
              modelChanges.merge(
                editor.drawingEntitiesManager.deleteMonomer(monomer),
              );
            });

            const nodeBeforePreviousNode = previousNode
              ? SequenceRenderer.getPreviousNodeInSameChain(previousNode)
              : undefined;

            if (nodeBeforePreviousNode) {
              if (previousNode instanceof Nucleoside) {
                // delete phosphate from last nucleotide
                modelChanges.merge(
                  editor.drawingEntitiesManager.deleteMonomer(
                    nodeBeforePreviousNode.lastMonomerInNode,
                  ),
                );
              }
              if (!(currentNode instanceof EmptySequenceNode)) {
                modelChanges.merge(
                  editor.drawingEntitiesManager.createPolymerBond(
                    previousNode instanceof Nucleoside
                      ? nodeBeforePreviousNode.firstMonomerInNode
                      : nodeBeforePreviousNode.lastMonomerInNode,
                    currentNode?.firstMonomerInNode as BaseMonomer,
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

            // create bond between previous and current chain
            modelChanges.merge(
              editor.drawingEntitiesManager.createPolymerBond(
                previousChainLastNonEmptyNode?.lastMonomerInNode,
                currentNode?.firstMonomerInNode as BaseMonomer,
                AttachmentPointName.R2,
                AttachmentPointName.R1,
              ),
            );
            SequenceRenderer.moveCaretBack();
            SequenceRenderer.moveCaretBack();
          }

          modelChanges.addOperation(new ReinitializeSequenceModeCommand());
          editor.renderersContainer.update(modelChanges);
          history.update(modelChanges);
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
          const rnaBaseName = event.code.replace('Key', '');
          const editor = CoreEditor.provideEditorInstance();
          const history = new EditorHistory(editor);
          const currentNode = SequenceRenderer.currentEdittingNode;
          const previousNode =
            SequenceRenderer.previousFromCurrentEdittingMonomer;
          const nodeBeforePreviousNode = previousNode
            ? SequenceRenderer.getPreviousNodeInSameChain(previousNode)
            : undefined;
          const previousNodeInSameChain =
            SequenceRenderer.previousNodeInSameChain;
          const modelChanges = new Command();
          const isEmptyChain =
            SequenceRenderer.chainsCollection.chains[
              SequenceRenderer.caretPosition[0]
            ].isEmpty;

          const newNodePosition = this.getNewSequenceItemPosition(
            previousNode,
            nodeBeforePreviousNode,
          );

          const nodeToAdd =
            currentNode instanceof Nucleotide ||
            currentNode instanceof Nucleoside
              ? Nucleotide.createOnCanvas(rnaBaseName, newNodePosition)
              : Nucleoside.createOnCanvas(rnaBaseName, newNodePosition);

          if (!(currentNode instanceof EmptySequenceNode)) {
            if (previousNodeInSameChain) {
              const r2Bond =
                previousNodeInSameChain?.lastMonomerInNode
                  .attachmentPointsToBonds.R2;
              assert(r2Bond);
              modelChanges.merge(
                editor.drawingEntitiesManager.deletePolymerBond(r2Bond),
              );
            }

            modelChanges.merge(
              editor.drawingEntitiesManager.createPolymerBond(
                nodeToAdd.lastMonomerInNode,
                currentNode?.firstMonomerInNode as BaseMonomer,
                AttachmentPointName.R2,
                AttachmentPointName.R1,
              ),
            );
          }

          if (previousNodeInSameChain instanceof Nucleoside) {
            const phosphateLibraryItem = getRnaPartLibraryItem(
              editor,
              RNA_NON_MODIFIED_PART.PHOSPHATE,
            );

            assert(phosphateLibraryItem);

            const additionalPhosphateAddCommand =
              editor.drawingEntitiesManager.addMonomer(
                phosphateLibraryItem,
                newNodePosition,
              );
            const additionalPhosphate = additionalPhosphateAddCommand
              .operations[0].monomer as BaseMonomer;
            modelChanges.merge(additionalPhosphateAddCommand);

            modelChanges.merge(
              editor.drawingEntitiesManager.createPolymerBond(
                previousNodeInSameChain.lastMonomerInNode,
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
          } else if (previousNodeInSameChain) {
            modelChanges.merge(
              editor.drawingEntitiesManager.createPolymerBond(
                previousNodeInSameChain.lastMonomerInNode,
                nodeToAdd.firstMonomerInNode,
                AttachmentPointName.R2,
                AttachmentPointName.R1,
              ),
            );
          }

          modelChanges.addOperation(new ReinitializeSequenceModeCommand());
          editor.renderersContainer.update(modelChanges);
          if (!(currentNode instanceof EmptySequenceNode) || isEmptyChain) {
            modelChanges.addOperation(SequenceRenderer.moveCaretForward());
          }
          history.update(modelChanges, true);
        },
      },
    };
  }

  private getNewSequenceItemPosition(
    previousNode?: SubChainNode,
    nodeBeforePreviousNode?: SubChainNode,
  ) {
    if (!previousNode || !nodeBeforePreviousNode) {
      return new Vec2(0, 0);
    }

    const offsetFromPrevious = new Vec2(1, 1);

    const nodeForPositionCalculation =
      previousNode instanceof EmptySequenceNode
        ? nodeBeforePreviousNode
        : previousNode;

    return nodeForPositionCalculation.lastMonomerInNode.position.add(
      offsetFromPrevious,
    );
  }
}
