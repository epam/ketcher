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
import { useCallback, useEffect, useMemo } from 'react';
import {
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
import { Nucleoside, Nucleotide } from 'ketcher-core';
import {
  calculateMonomerPreviewTop,
  calculateNucleoElementPreviewTop,
} from 'helpers';

const noPreviewTools = ['bond-single'];

export const EditorEvents = () => {
  const editor = useAppSelector(selectEditor);
  const activeTool = useAppSelector(selectEditorActiveTool);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handler = (toolName: string) => {
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
      editor.events.selectTool.dispatch('select-rectangle');
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

  const debouncedShowPreview = useMemo(
    () => debounce((p) => dispatchShowPreview(p), 500),
    [dispatchShowPreview],
  );

  const handleOpenPreview = useCallback(
    (e) => {
      const cardCoordinates = e.target.getBoundingClientRect();
      const left = `${cardCoordinates.left + cardCoordinates.width / 2}px`;

      const sequenceNode = e.target.__data__?.node;
      const monomer =
        e.target.__data__?.monomer?.monomerItem ||
        sequenceNode.monomer.monomerItem;
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

        debouncedShowPreview({
          preset: {
            monomers,
          },
          style: {
            left,
            top: monomer
              ? calculateNucleoElementPreviewTop(cardCoordinates)
              : '',
            transform: 'translate(-50%, 0)',
          },
        });
        return;
      }

      debouncedShowPreview({
        monomer,
        style: {
          left,
          top: monomer ? calculateMonomerPreviewTop(cardCoordinates) : '',
        },
      });
    },
    [debouncedShowPreview],
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

    const onMoveHandler = (e) => {
      handleClosePreview();
      const isLeftClick = e.buttons === 1;
      if (!isLeftClick || !noPreviewTools.includes(activeTool)) {
        handleOpenPreview(e);
      }
    };
    editor?.events.mouseOnMoveMonomer.add(onMoveHandler);
    editor?.events.mouseOnMoveSequenceItem.add(onMoveHandler);

    return () => {
      editor?.events.mouseOverMonomer.remove(handleOpenPreview);
      editor?.events.mouseLeaveMonomer.remove(handleClosePreview);
      editor?.events.mouseOnMoveMonomer.remove(onMoveHandler);
      editor?.events.mouseOnMoveSequenceItem.remove(onMoveHandler);
      editor?.events.mouseOverSequenceItem.remove(handleOpenPreview);
      editor?.events.mouseLeaveSequenceItem.remove(handleClosePreview);
    };
  }, [editor, activeTool, handleOpenPreview, handleClosePreview]);

  return <></>;
};
