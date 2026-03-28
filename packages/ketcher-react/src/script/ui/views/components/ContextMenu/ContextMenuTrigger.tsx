import {
  FunctionalGroup,
  ketcherProvider,
  MULTITAIL_ARROW_KEY,
} from 'ketcher-core';
import { FC, PropsWithChildren, useCallback } from 'react';
import { useContextMenu } from 'react-contexify';
import { useAppContext } from 'src/hooks';
import Editor from 'src/script/editor';
import {
  ContextMenuProps,
  ContextMenuTriggerType,
  CONTEXT_MENU_ID,
} from './contextMenu.types';
import {
  getIsItemInSelection,
  getMenuPropsForClosestItem,
  getMenuPropsForSelection,
} from './ContextMenuTrigger.utils';
import TemplateTool from 'src/script/editor/tool/template';

const ContextMenuTrigger: FC<PropsWithChildren> = ({ children }) => {
  const { ketcherId } = useAppContext();
  const { show } = useContextMenu<ContextMenuProps>();

  const shouldBlockMonomerCreationContextMenu = useCallback(
    (editor: Editor, showProps: ContextMenuProps | null) => {
      if (!editor.isMonomerCreationWizardActive || !showProps) {
        return false;
      }

      return showProps.id === CONTEXT_MENU_ID.FOR_BONDS + ketcherId;
    },
    [ketcherId],
  );

  const getSelectedGroupsInfo = useCallback(() => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
    const struct = editor.struct();
    const selectedAtomIds = editor.selection()?.atoms;
    const selectedFunctionalGroups = new Map<number, FunctionalGroup>();
    const selectedSGroupsIds: Set<number> = new Set();

    selectedAtomIds?.forEach((atomId) => {
      const functionalGroup = FunctionalGroup.findFunctionalGroupByAtom(
        struct.functionalGroups,
        atomId,
        true,
      );

      const relatedSGroup = functionalGroup?.relatedSGroup;

      if (
        functionalGroup !== null &&
        relatedSGroup &&
        !relatedSGroup.isSuperatomWithoutLabel
      ) {
        selectedFunctionalGroups.set(
          functionalGroup.relatedSGroupId,
          functionalGroup,
        );
      }

      const sGroupId = struct.sgroups.find(
        (_, sGroup) =>
          !sGroup.isSuperatomWithoutLabel && sGroup.atoms.includes(atomId),
      );

      sGroupId !== null && selectedSGroupsIds.add(sGroupId);
    });

    return {
      selectedFunctionalGroups,
      selectedSGroupsIds,
    };
  }, [ketcherId]);

  const handleAttachmentPointMenu = useCallback(
    (event: React.MouseEvent<HTMLDivElement>, target: Element): boolean => {
      const rLabelElement = target.closest('[data-attachment-point-name]');
      if (!rLabelElement) return false;

      const attachmentPointName = rLabelElement.getAttribute(
        'data-attachment-point-name',
      );
      if (!attachmentPointName) return false;

      show({
        id: CONTEXT_MENU_ID.FOR_ATTACHMENT_POINT_LABEL + ketcherId,
        event,
        props: {
          attachmentPointName,
          ketcherId,
        },
      });
      return true;
    },
    [ketcherId, show],
  );

  const determineTriggerType = useCallback(
    (
      closestItem: ReturnType<Editor['findItem']>,
      selection: ReturnType<Editor['selection']>,
      selectedFunctionalGroups: Map<number, FunctionalGroup>,
      selectedSGroupsIds: Set<number>,
      editor: Editor,
      event: React.MouseEvent<HTMLDivElement>,
    ): ContextMenuTriggerType | null => {
      if (!closestItem) {
        const isLeftMouseButtonPressed = event.buttons === 1;
        const isRotationReverted = isLeftMouseButtonPressed;
        if (selection && !isRotationReverted) {
          editor.selection(null);
        }
        return null;
      }

      if (!selection) {
        return ContextMenuTriggerType.ClosestItem;
      }

      if (
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
          return selection[MULTITAIL_ARROW_KEY]
            ? ContextMenuTriggerType.ClosestItem
            : ContextMenuTriggerType.None;
        }
        return ContextMenuTriggerType.Selection;
      }

      // closestItem is outside of selection
      editor.selection(null);
      return ContextMenuTriggerType.ClosestItem;
    },
    [],
  );

  const handleDisplay = useCallback<React.MouseEventHandler<HTMLDivElement>>(
    (event) => {
      event.preventDefault();

      const ketcher = ketcherProvider.getKetcher(ketcherId);
      const editor = ketcher.editor as Editor;

      if (editor.render.options.viewOnlyMode) {
        return;
      }

      const currentTool = editor.tool();
      if (currentTool instanceof TemplateTool) {
        currentTool.cancel();
      }

      // TODO: Consider a better approach to handle context menus for auxiliary UI elements
      const target = event.target as Element;
      if (
        editor.isMonomerCreationWizardActive &&
        handleAttachmentPointMenu(event, target)
      ) {
        return;
      }

      const closestItem = editor.findItem(event, null);
      const selection = editor.selection();
      const { selectedFunctionalGroups, selectedSGroupsIds } =
        getSelectedGroupsInfo();

      const triggerType = determineTriggerType(
        closestItem,
        selection,
        selectedFunctionalGroups,
        selectedSGroupsIds,
        editor,
        event,
      );

      if (triggerType === null || triggerType === ContextMenuTriggerType.None) {
        return;
      }

      let showProps: ContextMenuProps | null = null;

      switch (triggerType) {
        case ContextMenuTriggerType.ClosestItem: {
          showProps = closestItem
            ? getMenuPropsForClosestItem(editor, closestItem, ketcherId)
            : null;
          break;
        }

        case ContextMenuTriggerType.Selection: {
          showProps = getMenuPropsForSelection(
            selection,
            selectedFunctionalGroups,
            ketcherId,
          );
          break;
        }
      }

      if (shouldBlockMonomerCreationContextMenu(editor, showProps)) {
        return;
      }

      showProps &&
        show({
          id: showProps.id,
          event,
          props: { ...showProps, ketcherId },
        });
    },
    [
      getSelectedGroupsInfo,
      shouldBlockMonomerCreationContextMenu,
      handleAttachmentPointMenu,
      determineTriggerType,
      show,
      ketcherId,
    ],
  );

  return (
    <div
      style={{ height: '100%' }}
      onContextMenu={handleDisplay}
      role="application"
    >
      {children}
    </div>
  );
};

export default ContextMenuTrigger;
