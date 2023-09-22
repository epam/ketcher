import { FunctionalGroup } from 'ketcher-core';
import Editor from 'src/script/editor';
import {
  ClosestItem,
  CONTEXT_MENU_ID,
  ContextMenuShowProps,
  GetIsItemInSelectionArgs,
} from './contextMenu.types';
import { Selection } from '../../../../editor/Editor';
import { onlyHasProperty } from './utils';

export const getIsItemInSelection = ({
  item,
  selection,
  selectedSGroupsIds,
  selectedFunctionalGroups,
}: GetIsItemInSelectionArgs): boolean => {
  if (!item || !selection) {
    return false;
  }

  switch (item.map) {
    case 'sgroups':
      return selectedSGroupsIds.has(item.id);

    case 'functionalGroups':
      return Array.from(selectedFunctionalGroups.keys()).includes(item.id);

    default:
      return (
        item.map in selection &&
        Array.isArray(selection[item.map]) &&
        selection[item.map].includes(item.id)
      );
  }
};

export function getMenuPropsForClosestItem(
  editor: Editor,
  closestItem: ClosestItem,
): ContextMenuShowProps | null {
  const struct = editor.struct();

  switch (closestItem.map) {
    case 'bonds': {
      const functionalGroup = FunctionalGroup.findFunctionalGroupByBond(
        struct,
        struct.functionalGroups,
        closestItem.id,
        true,
      );

      return functionalGroup === null
        ? {
            id: CONTEXT_MENU_ID.FOR_BONDS,
            bondIds: [closestItem.id],
          }
        : {
            id: CONTEXT_MENU_ID.FOR_FUNCTIONAL_GROUPS,
            functionalGroups: [functionalGroup],
          };
    }

    case 'atoms': {
      const functionalGroup = FunctionalGroup.findFunctionalGroupByAtom(
        struct.functionalGroups,
        closestItem.id,
        true,
      );

      return functionalGroup === null
        ? {
            id: CONTEXT_MENU_ID.FOR_ATOMS,
            atomIds: [closestItem.id],
          }
        : {
            id: CONTEXT_MENU_ID.FOR_FUNCTIONAL_GROUPS,
            functionalGroups: [functionalGroup],
          };
    }

    case 'sgroups':
    case 'functionalGroups': {
      const sGroup = struct.sgroups.get(closestItem.id);
      const functionalGroup = FunctionalGroup.findFunctionalGroupBySGroup(
        struct.functionalGroups,
        sGroup,
      );

      return functionalGroup
        ? {
            id: CONTEXT_MENU_ID.FOR_FUNCTIONAL_GROUPS,
            functionalGroups: [functionalGroup],
          }
        : null;
    }

    case 'rgroupAttachmentPoints': {
      const atomId = struct.rgroupAttachmentPoints.get(closestItem.id)?.atomId;

      return {
        id: CONTEXT_MENU_ID.FOR_R_GROUP_ATTACHMENT_POINT,
        rgroupAttachmentPoints: [closestItem.id],
        atomIds: typeof atomId === 'number' ? [atomId] : undefined,
      };
    }

    default:
      return null;
  }
}

const IGNORED_MAPS_LIST = ['enhancedFlags'];

export function getMenuPropsForSelection(
  selection: Selection | null,
  selectedFunctionalGroups: Map<number, FunctionalGroup>,
): ContextMenuShowProps | null {
  if (!selection) {
    return null;
  }

  const bondsInSelection = 'bonds' in selection;
  const atomsInSelection = 'atoms' in selection;
  const isRGroupAttachmentPointsSelected =
    'rgroupAttachmentPoints' in selection;

  if (selectedFunctionalGroups.size > 0) {
    const functionalGroups = Array.from(selectedFunctionalGroups.values());
    return {
      id: CONTEXT_MENU_ID.FOR_FUNCTIONAL_GROUPS,
      functionalGroups,
    };
  } else if (
    bondsInSelection &&
    !atomsInSelection &&
    !isRGroupAttachmentPointsSelected
  ) {
    return {
      id: CONTEXT_MENU_ID.FOR_BONDS,
      bondIds: selection.bonds,
      extraItemsSelected: !onlyHasProperty(
        selection,
        'bonds',
        IGNORED_MAPS_LIST,
      ),
    };
  } else if (
    atomsInSelection &&
    !bondsInSelection &&
    !isRGroupAttachmentPointsSelected
  ) {
    return {
      id: CONTEXT_MENU_ID.FOR_ATOMS,
      atomIds: selection.atoms,
      extraItemsSelected: !onlyHasProperty(
        selection,
        'atoms',
        IGNORED_MAPS_LIST,
      ),
    };
  } else if (
    isRGroupAttachmentPointsSelected &&
    !bondsInSelection &&
    !atomsInSelection
  ) {
    return {
      id: CONTEXT_MENU_ID.FOR_R_GROUP_ATTACHMENT_POINT,
      rgroupAttachmentPoints: selection.rgroupAttachmentPoints,
      extraItemsSelected: !onlyHasProperty(
        selection,
        'rgroupAttachmentPoints',
        IGNORED_MAPS_LIST,
      ),
    };
  } else {
    return {
      id: CONTEXT_MENU_ID.FOR_SELECTION,
      bondIds: selection.bonds,
      atomIds: selection.atoms,
    };
  }
}
