/****************************************************************************
 * Copyright 2022 EPAM Systems
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

import { FunctionalGroup } from 'ketcher-core';
import { PropsWithChildren, useCallback } from 'react';
import { useContextMenu } from 'react-contexify';
import { useAppContext } from 'src/hooks';
import Editor from 'src/script/editor';
import {
  ContextMenuShowProps,
  ContextMenuTriggerType,
} from './contextMenu.types';
import {
  getMenuPropsForClosestItem,
  getIsItemInSelection,
  getMenuPropsForSelection,
} from './ContextMenuTrigger.utils';
import TemplateTool from 'src/script/editor/tool/template';

const ContextMenuTrigger: React.FC<PropsWithChildren> = ({ children }) => {
  const { getKetcherInstance } = useAppContext();
  const { show } = useContextMenu<ContextMenuShowProps>();

  const getSelectedGroupsInfo = useCallback(() => {
    const editor = getKetcherInstance().editor as Editor;
    const struct = editor.struct();
    const selectedAtomIds = editor.selection()?.atoms;
    // Map and Set can do deduplication
    const selectedFunctionalGroups = new Map<number, FunctionalGroup>();
    const selectedSGroupsIds: Set<number> = new Set();

    selectedAtomIds?.forEach((atomId) => {
      const functionalGroup = FunctionalGroup.findFunctionalGroupByAtom(
        struct.functionalGroups,
        atomId,
        true,
      );

      functionalGroup !== null &&
        selectedFunctionalGroups.set(
          functionalGroup.relatedSGroupId,
          functionalGroup,
        );

      const sGroupId = struct.sgroups.find((_, sGroup) =>
        sGroup.atoms.includes(atomId),
      );

      sGroupId !== null && selectedSGroupsIds.add(sGroupId);
    });

    return {
      selectedFunctionalGroups,
      selectedSGroupsIds,
    };
  }, [getKetcherInstance]);

  const handleDisplay = useCallback<React.MouseEventHandler<HTMLDivElement>>(
    (event) => {
      event.preventDefault();

      const editor = getKetcherInstance().editor as Editor;

      const currentTool = editor.tool();
      if (currentTool instanceof TemplateTool) {
        currentTool.hidePreview();
      }

      const closestItem = editor.findItem(event, null);
      const selection = editor.selection();
      const { selectedFunctionalGroups, selectedSGroupsIds } =
        getSelectedGroupsInfo();

      let showProps: ContextMenuShowProps = null;
      let triggerType: ContextMenuTriggerType;

      if (!closestItem) {
        const isLeftMouseButtonPressed = event.buttons === 1;
        const isRotationReverted = isLeftMouseButtonPressed;
        if (selection && !isRotationReverted) {
          // if it was a click outside of any item
          editor.selection(null);
        }
        return;
      } else if (!selection) {
        triggerType = ContextMenuTriggerType.ClosestItem;
      } else if (
        getIsItemInSelection({
          item: closestItem,
          selection,
          selectedFunctionalGroups,
          selectedSGroupsIds,
        })
      ) {
        if (
          !selection.bonds &&
          !selection.atoms &&
          !selection.rgroupAttachmentPoints
        ) {
          triggerType = ContextMenuTriggerType.None;
        } else {
          triggerType = ContextMenuTriggerType.Selection;
        }
      } else {
        // closestItem is outside of selection
        editor.selection(null);
        triggerType = ContextMenuTriggerType.ClosestItem;
      }

      switch (triggerType) {
        case ContextMenuTriggerType.None: {
          return;
        }

        case ContextMenuTriggerType.ClosestItem: {
          showProps = getMenuPropsForClosestItem(editor, closestItem);
          break;
        }

        case ContextMenuTriggerType.Selection: {
          showProps = getMenuPropsForSelection(
            selection,
            selectedFunctionalGroups,
          );
          break;
        }
      }

      showProps &&
        show({
          id: showProps.id,
          event,
          props: showProps,
        });
    },
    [getKetcherInstance, getSelectedGroupsInfo, show],
  );

  return (
    <div style={{ height: '100%' }} onContextMenu={handleDisplay}>
      {children}
    </div>
  );
};

export default ContextMenuTrigger;
