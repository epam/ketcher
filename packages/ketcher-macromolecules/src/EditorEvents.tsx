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
  selectTool,
  showPreview,
} from 'state/common';
import { openErrorModal, openErrorTooltip, openModal } from 'state/modal';
import {
  ConfirmationDialogOnlyProps,
  MonomerConnectionOnlyProps,
} from 'components/modal/modalContainer';
import { useAppDispatch, useAppSelector } from 'hooks';
import { debounce } from 'lodash';
import {
  AmbiguousMonomer,
  BaseMonomer,
  Nucleoside,
  Nucleotide,
  PolymerBond,
  HydrogenBond,
  BackBoneSequenceNode,
  ToolName,
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
} from 'state/types';
import { calculateBondPreviewPosition } from 'ketcher-react';
import { loadMonomerLibrary } from 'state/library';

const noPreviewTools = [ToolName.bondSingle, ToolName.selectRectangle];

export const EditorEvents = () => {
  const editor = useAppSelector(selectEditor);
  const activeTool = useAppSelector(selectEditorActiveTool);
  const dispatch = useAppDispatch();
  const presets = useAppSelector(selectAllPresets);
  const hasAtLeastOneAntisense = useAppSelector(hasAntisenseChains);

  const handleMonomersLibraryUpdate = useCallback(() => {
    dispatch(loadMonomerLibrary(editor?.monomersLibrary));
  }, [editor]);

  useEffect(() => {
    editor?.events.updateMonomersLibrary.add(handleMonomersLibraryUpdate);

    return () => {
      editor?.events.updateMonomersLibrary.remove(handleMonomersLibraryUpdate);
    };
  }, [editor]);

  useEffect(() => {
    const handler = ([toolName]: [string]) => {
      if (toolName !== activeTool) {
        dispatch(selectTool(toolName));
      }
    };

    if (editor) {
      editor.events.error.add((errorText) => {
        dispatch(openErrorTooltip(errorText));
      });
      editor.events.openErrorModal.add(
        (errorData: string | { errorMessage: string; errorTitle: string }) => {
          dispatch(openErrorModal(errorData));
        },
      );

      dispatch(selectTool('select-rectangle'));
      editor.events.selectTool.dispatch(['select-rectangle']);
      editor.events.openMonomerConnectionModal.add(
        (additionalProps: MonomerConnectionOnlyProps) =>
          dispatch(
            openModal({
              name: 'monomerConnection',
              additionalProps,
            }),
          ),
      );
      editor.events.openConfirmationDialog.add(
        (additionalProps: ConfirmationDialogOnlyProps) =>
          dispatch(
            openModal({
              name: 'confirmationDialog',
              additionalProps,
            }),
          ),
      );
      editor.events.selectTool.add(handler);
    }

    return () => {
      dispatch(selectTool(null));
      editor?.events.selectTool.remove(handler);
    };
  }, [editor]);

  const dispatchShowPreview = useCallback(
    (payload) => dispatch(showPreview(payload)),
    [dispatch],
  );

  const debouncedShowPreview = useCallback(
    debounce((p) => dispatchShowPreview(p), 500),
    [dispatchShowPreview],
  );

  useEffect(() => {
    const handler = ([toolName]: [string]) => {
      if (toolName !== activeTool) {
        dispatch(selectTool(toolName));
      }
    };

    if (editor) {
      editor.events.error.add((errorText) => {
        dispatch(openErrorTooltip(errorText));
      });
      editor.events.openErrorModal.add(
        (errorData: string | { errorMessage: string; errorTitle: string }) => {
          dispatch(openErrorModal(errorData));
        },
      );

      dispatch(selectTool('select-rectangle'));
      editor.events.selectTool.dispatch(['select-rectangle']);
      editor.events.openMonomerConnectionModal.add(
        (additionalProps: MonomerConnectionOnlyProps) =>
          dispatch(
            openModal({
              name: 'monomerConnection',
              additionalProps,
            }),
          ),
      );
      editor.events.selectTool.add(handler);
    }

    return () => {
      dispatch(selectTool(null));
      editor?.events.selectTool.remove(handler);
    };
  }, [editor]);

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
    [handleOpenBondPreview, debouncedShowPreview, presets],
  );

  const handleClosePreview = useCallback(() => {
    debouncedShowPreview.cancel();
    dispatch(showPreview(undefined));
  }, [debouncedShowPreview, dispatch]);

  useEffect(() => {
    editor?.events.mouseOverMonomer.add(handleOpenPreview);
    editor?.events.mouseLeaveMonomer.add(handleClosePreview);
    editor?.events.mouseOverSequenceItem.add(handleOpenPreview);
    editor?.events.mouseLeaveSequenceItem.add(handleClosePreview);
    editor?.events.mouseOverPolymerBond.add(handleOpenPreview);
    editor?.events.mouseLeavePolymerBond.add(handleClosePreview);

    const onMoveHandler = (e) => {
      handleClosePreview();
      const isLeftClick = e.buttons === 1;
      if (!isLeftClick || !noPreviewTools.includes(activeTool)) {
        handleOpenPreview(e);
      }
    };
    editor?.events.mouseOnMoveMonomer.add(onMoveHandler);
    editor?.events.mouseOnMoveSequenceItem.add(onMoveHandler);
    editor?.events.mouseOnMovePolymerBond.add(onMoveHandler);

    window.addEventListener('hidePreview', handleClosePreview);

    return () => {
      editor?.events.mouseOverMonomer.remove(handleOpenPreview);
      editor?.events.mouseLeaveMonomer.remove(handleClosePreview);
      editor?.events.mouseOverSequenceItem.remove(handleOpenPreview);
      editor?.events.mouseLeaveSequenceItem.remove(handleClosePreview);
      editor?.events.mouseOverPolymerBond.remove(handleOpenPreview);
      editor?.events.mouseLeavePolymerBond.remove(handleClosePreview);

      editor?.events.mouseOnMoveMonomer.remove(onMoveHandler);
      editor?.events.mouseOnMoveSequenceItem.remove(onMoveHandler);
      editor?.events.mouseOnMovePolymerBond.remove(onMoveHandler);

      window.removeEventListener('hidePreview', handleClosePreview);
    };
  }, [editor, activeTool, handleOpenPreview, handleClosePreview]);

  useEffect(() => {
    if (!hasAtLeastOneAntisense) {
      editor?.events.resetSequenceEditMode.dispatch();
    }
  }, [hasAtLeastOneAntisense]);

  return <></>;
};
