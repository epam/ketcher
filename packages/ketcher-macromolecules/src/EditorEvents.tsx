/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/use-memo */
/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/
import { useCallback, useEffect } from 'react';
import {
  hasAntisenseChains,
  selectEditor,
  selectEditorActiveTool,
  selectIsContextMenuActive,
  selectLastSelectedSelectionMenuItem,
  selectTool,
} from 'state/common';
import { openErrorModal, openErrorTooltip, openModal } from 'state/modal';
import {
  ConfirmationDialogOnlyProps,
  MonomerConnectionOnlyProps,
} from 'components/modal/modalContainer';
import { useAppDispatch, useAppSelector, useDebouncedShowPreview } from 'hooks';

import {
  AmbiguousMonomer,
  BaseMonomer,
  Nucleoside,
  Nucleotide,
  PolymerBond,
  HydrogenBond,
  BackBoneSequenceNode,
  LinkerSequenceNode,
  ToolName,
  AtomRenderer,
  BaseRenderer,
  guardForMacromoleculesEditor,
} from 'ketcher-core';
import { selectAllPresets } from 'state/rna-builder';
import {
  AmbiguousMonomerPreviewState,
  BondPreviewState,
  MonomerPreviewState,
  PresetPosition,
  PresetPreviewState,
  PreviewStyle,
  PreviewType,
  TextPreviewState,
} from 'state/types';
import { calculateBondPreviewPosition } from 'ketcher-react';
import { loadDefaultPresets, loadMonomerLibrary } from 'state/library';

const noPreviewTools = [ToolName.bondSingle, ToolName.selectRectangle];

export const EditorEvents = () => {
  const editor = useAppSelector(selectEditor);
  const activeTool = useAppSelector(selectEditorActiveTool);
  const isContextMenuActive = useAppSelector(selectIsContextMenuActive);
  const dispatch = useAppDispatch();
  const presets = useAppSelector(selectAllPresets);
  const hasAtLeastOneAntisense = useAppSelector(hasAntisenseChains);
  const lastSelectedSelectionMenuItem = useAppSelector(
    selectLastSelectedSelectionMenuItem,
  );

  const handleMonomersLibraryUpdate = useCallback(() => {
    dispatch(loadMonomerLibrary(editor?.monomersLibrary));
    dispatch(loadDefaultPresets(editor?.defaultRnaPresetsLibraryItems));
  }, [editor]);

  useEffect(() => {
    editor?.events.updateMonomersLibrary.add(handleMonomersLibraryUpdate);

    return () => {
      editor?.events.updateMonomersLibrary.remove(handleMonomersLibraryUpdate);
    };
  }, [editor, handleMonomersLibraryUpdate]);

  useEffect(() => {
    const onSelectSelectionTool = () => {
      editor?.events.selectTool.dispatch([lastSelectedSelectionMenuItem]);
      dispatch(selectTool(lastSelectedSelectionMenuItem));
    };

    if (editor) {
      editor.events.selectSelectionTool.add(onSelectSelectionTool);
    }

    return () => {
      editor?.events.selectSelectionTool.remove(onSelectSelectionTool);
    };
  }, [dispatch, editor, lastSelectedSelectionMenuItem]);

  useEffect(() => {
    const handler = ([toolName]: [string]) => {
      dispatch(selectTool(toolName));
    };
    const handleError = (errorText: string) => {
      dispatch(openErrorTooltip(errorText));
    };
    const handleOpenErrorModal = (
      errorData: string | { errorMessage: string; errorTitle: string },
    ) => {
      dispatch(openErrorModal(errorData));
    };
    const handleOpenMonomerConnectionModal = (
      additionalProps: MonomerConnectionOnlyProps,
    ) => dispatch(openModal({ name: 'monomerConnection', additionalProps }));
    const handleOpenConfirmationDialog = (
      additionalProps: ConfirmationDialogOnlyProps,
    ) => dispatch(openModal({ name: 'confirmationDialog', additionalProps }));

    if (editor) {
      editor.events.error.add(handleError);
      editor.events.openErrorModal.add(handleOpenErrorModal);
      dispatch(selectTool('select-rectangle'));
      editor.events.selectTool.dispatch(['select-rectangle']);
      editor.events.openMonomerConnectionModal.add(
        handleOpenMonomerConnectionModal,
      );
      editor.events.openConfirmationDialog.add(handleOpenConfirmationDialog);
      editor.events.selectTool.add(handler);
    }

    return () => {
      dispatch(selectTool(null));
      editor?.events.selectTool.remove(handler);
      editor?.events.error.remove(handleError);
      editor?.events.openErrorModal.remove(handleOpenErrorModal);
      editor?.events.openMonomerConnectionModal.remove(
        handleOpenMonomerConnectionModal,
      );
      editor?.events.openConfirmationDialog.remove(
        handleOpenConfirmationDialog,
      );
    };
  }, [editor, dispatch]);

  const debouncedShowPreview = useDebouncedShowPreview();

  const handleOpenBondPreview = useCallback(
    (polymerBond: PolymerBond, style: PreviewStyle) => {
      const previewData: BondPreviewState = {
        type: PreviewType.Bond,
        polymerBond,
        style,
      };

      debouncedShowPreview(previewData);
    },
    [debouncedShowPreview],
  );

  const handleOpenPreview = useCallback(
    (e) => {
      if (e.buttons === 1) {
        return;
      }

      if (e.buttons === 2) {
        return;
      }

      if (isContextMenuActive) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      const polymerBond = e.target.__data__?.polymerBond;

      if (
        (polymerBond && !polymerBond.finished) ||
        polymerBond instanceof HydrogenBond
      ) {
        return;
      }

      if (polymerBond) {
        const style = calculateBondPreviewPosition(
          polymerBond,
          e.target.getBoundingClientRect(),
        );

        handleOpenBondPreview(polymerBond, style);
        return;
      }

      // TODO: Split to separate functions for monomers and presets
      const sequenceNode = e.target.__data__?.node;
      const monomer: BaseMonomer | AmbiguousMonomer =
        e.target.__data__?.monomer || sequenceNode?.monomer;

      if (sequenceNode && sequenceNode instanceof BackBoneSequenceNode) {
        return;
      }

      if (monomer instanceof AmbiguousMonomer) {
        const ambiguousMonomerPreviewData: AmbiguousMonomerPreviewState = {
          type: PreviewType.AmbiguousMonomer,
          monomer: monomer.variantMonomerItem,
          target: e.target,
        };

        debouncedShowPreview(ambiguousMonomerPreviewData);
        return;
      }

      const monomerItem = monomer.monomerItem;
      const attachmentPointsToBonds = { ...monomer.attachmentPointsToBonds };
      const isNucleotideOrNucleoside =
        sequenceNode instanceof Nucleotide ||
        sequenceNode instanceof Nucleoside;

      // Check if this is a LinkerSequenceNode with multiple monomers (e.g., CHEM chain)
      if (sequenceNode instanceof LinkerSequenceNode) {
        const monomers = sequenceNode.monomers;

        // If there are multiple monomers in the chain, show them all in a preset-style preview
        if (monomers.length > 1) {
          const chemChainPreviewData: PresetPreviewState = {
            type: PreviewType.Preset,
            monomers: monomers.map((m) => m.monomerItem),
            position: PresetPosition.ChainMiddle,
            target: e.target,
          };

          debouncedShowPreview(chemChainPreviewData);
          return;
        }
      }

      if (isNucleotideOrNucleoside) {
        const monomers =
          sequenceNode instanceof Nucleotide
            ? [
                sequenceNode.sugar.monomerItem,
                sequenceNode.rnaBase.monomerItem,
                sequenceNode.phosphate?.monomerItem,
              ]
            : [
                sequenceNode.sugar.monomerItem,
                sequenceNode.rnaBase.monomerItem,
              ];

        if (sequenceNode.rnaBase instanceof AmbiguousMonomer) {
          const ambiguousMonomerPreviewData: AmbiguousMonomerPreviewState = {
            type: PreviewType.AmbiguousMonomer,
            monomer: sequenceNode.rnaBase.variantMonomerItem,
            presetMonomers: monomers,
            target: e.target,
          };

          debouncedShowPreview(ambiguousMonomerPreviewData);
          return;
        }

        const existingPreset = presets.find((preset) => {
          const presetMonomers = [preset.sugar, preset.base, preset.phosphate];
          return monomers.every((monomer, index) => {
            return monomer?.props.Name === presetMonomers[index]?.props.Name;
          });
        });

        let position: PresetPosition;
        if (sequenceNode instanceof Nucleoside) {
          position = PresetPosition.ChainEnd;
        } else if (
          sequenceNode.firstMonomerInNode.R1AttachmentPoint !== undefined
        ) {
          position = PresetPosition.ChainStart;
        } else {
          position = PresetPosition.ChainMiddle;
        }

        const presetPreviewData: PresetPreviewState = {
          type: PreviewType.Preset,
          monomers,
          name: existingPreset?.name,
          idtAliases: existingPreset?.idtAliases,
          aliasAxoLabs: existingPreset?.aliasAxoLabs,
          phosphatePosition:
            sequenceNode instanceof Nucleotide ? 'right' : undefined,
          position,
          target: e.target,
        };

        debouncedShowPreview(presetPreviewData);
        return;
      }

      const monomerPreviewData: MonomerPreviewState = {
        type: PreviewType.Monomer,
        monomer: monomerItem,
        attachmentPointsToBonds,
        target: e.target,
      };

      debouncedShowPreview(monomerPreviewData);
    },
    [handleOpenBondPreview, debouncedShowPreview, presets, isContextMenuActive],
  );

  const handleClosePreview = useCallback(() => {
    debouncedShowPreview.cancel();
    dispatch(showPreview(undefined));
  }, [debouncedShowPreview, dispatch]);

  const handleOpenAtomLabelTooltip = useCallback(
    (e) => {
      const renderer: BaseRenderer = e.target.__data__;

      if (!(renderer instanceof AtomRenderer)) {
        return;
      }

      const tooltipText: string | null | undefined = renderer?.labelTooltipText;
      if (!tooltipText) {
        return;
      }
      const textPreviewData: TextPreviewState = {
        type: PreviewType.Text,
        text: tooltipText,
        target: e.target,
      };
      debouncedShowPreview(textPreviewData);
    },
    [debouncedShowPreview],
  );

  useEffect(() => {
    editor?.events.mouseOverMonomer.add(handleOpenPreview);
    editor?.events.mouseLeaveMonomer.add(handleClosePreview);
    editor?.events.mouseLeaveAttachmentPoint.add(handleClosePreview);
    editor?.events.mouseDownAttachmentPoint.add(handleClosePreview);
    editor?.events.mouseOverSequenceItem.add(handleOpenPreview);
    editor?.events.mouseLeaveSequenceItem.add(handleClosePreview);
    editor?.events.mouseOverPolymerBond.add(handleOpenPreview);
    editor?.events.mouseLeavePolymerBond.add(handleClosePreview);
    editor?.events.mouseOverDrawingEntity.add(handleOpenAtomLabelTooltip);
    editor?.events.mouseLeaveDrawingEntity.add(handleClosePreview);

    const onMoveHandler = (e) => {
      handleClosePreview();
      const isLeftClick = e.buttons === 1;
      if (!isLeftClick || !noPreviewTools.includes(activeTool)) {
        handleOpenPreview(e);
      }
    };
    editor?.events.mouseOnMoveMonomer.add(onMoveHandler);
    editor?.events.mouseMoveAttachmentPoint.add(onMoveHandler);
    editor?.events.mouseOnMoveSequenceItem.add(onMoveHandler);
    editor?.events.mouseOnMovePolymerBond.add(onMoveHandler);

    const guardedHandleClosePreview =
      guardForMacromoleculesEditor(handleClosePreview);
    window.addEventListener('hidePreview', guardedHandleClosePreview);

    return () => {
      editor?.events.mouseOverMonomer.remove(handleOpenPreview);
      editor?.events.mouseLeaveMonomer.remove(handleClosePreview);
      editor?.events.mouseLeaveAttachmentPoint.remove(handleClosePreview);
      editor?.events.mouseDownAttachmentPoint.remove(handleClosePreview);
      editor?.events.mouseOverSequenceItem.remove(handleOpenPreview);
      editor?.events.mouseLeaveSequenceItem.remove(handleClosePreview);
      editor?.events.mouseOverPolymerBond.remove(handleOpenPreview);
      editor?.events.mouseLeavePolymerBond.remove(handleClosePreview);
      editor?.events.mouseOverDrawingEntity.remove(handleOpenAtomLabelTooltip);
      editor?.events.mouseLeaveDrawingEntity.remove(handleClosePreview);

      editor?.events.mouseOnMoveMonomer.remove(onMoveHandler);
      editor?.events.mouseMoveAttachmentPoint.remove(onMoveHandler);
      editor?.events.mouseOnMoveSequenceItem.remove(onMoveHandler);
      editor?.events.mouseOnMovePolymerBond.remove(onMoveHandler);

      window.removeEventListener('hidePreview', guardedHandleClosePreview);
    };
  }, [
    editor,
    activeTool,
    handleOpenPreview,
    handleClosePreview,
    handleOpenAtomLabelTooltip,
  ]);

  useEffect(() => {
    if (!hasAtLeastOneAntisense) {
      editor?.events.resetSequenceEditMode.dispatch();
    }
  }, [hasAtLeastOneAntisense, editor]);

  return <></>;
};
