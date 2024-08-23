import {
  FunctionalGroup,
  MonomerMicromolecule,
  MULTITAIL_ARROW_KEY,
  ReMultitailArrow,
} from 'ketcher-core';
import Editor, { ClosestItemWithMap } from 'src/script/editor';
import {
  CONTEXT_MENU_ID,
  ContextMenuProps,
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
  closestItem: ClosestItemWithMap,
): ContextMenuProps | null {
  const struct = editor.struct();

  switch (closestItem.map) {
    case 'bonds': {
      const functionalGroup = FunctionalGroup.findFunctionalGroupByBond(
        struct,
        struct.functionalGroups,
        closestItem.id,
        true,
      );

      return functionalGroup === null ||
        functionalGroup?.relatedSGroup.isSuperatomWithoutLabel
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

      return functionalGroup === null ||
        functionalGroup?.relatedSGroup.isSuperatomWithoutLabel
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
      if (sGroup instanceof MonomerMicromolecule) return null;
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

    case MULTITAIL_ARROW_KEY: {
      const closestItemTyped = closestItem as unknown as ReturnType<
        ReMultitailArrow['calculateDistanceToPoint']
      >;
      return {
        id: CONTEXT_MENU_ID.FOR_MULTITAIL_ARROW,
        itemId: closestItem.id,
        tailId: closestItemTyped?.ref?.tailId || null,
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
): ContextMenuProps | null {
  if (!selection) {
    return null;
  }

  const { bonds, atoms, rgroupAttachmentPoints } = selection;

  if (selectedFunctionalGroups.size > 0) {
    const functionalGroups = Array.from(selectedFunctionalGroups.values());
    return {
      id: CONTEXT_MENU_ID.FOR_FUNCTIONAL_GROUPS,
      functionalGroups,
    };
  } else if (bonds && !atoms && !rgroupAttachmentPoints) {
    return {
      id: CONTEXT_MENU_ID.FOR_BONDS,
      bondIds: bonds,
      extraItemsSelected: !onlyHasProperty(
        selection,
        'bonds',
        IGNORED_MAPS_LIST,
      ),
    };
  } else if (atoms && !bonds && !rgroupAttachmentPoints) {
    return {
      id: CONTEXT_MENU_ID.FOR_ATOMS,
      atomIds: atoms,
      extraItemsSelected: !onlyHasProperty(
        selection,
        'atoms',
        IGNORED_MAPS_LIST,
      ),
    };
  } else if (rgroupAttachmentPoints && !bonds && !atoms) {
    return {
      id: CONTEXT_MENU_ID.FOR_R_GROUP_ATTACHMENT_POINT,
      rgroupAttachmentPoints,
      extraItemsSelected: !onlyHasProperty(
        selection,
        'rgroupAttachmentPoints',
        IGNORED_MAPS_LIST,
      ),
    };
  } else {
    return {
      id: CONTEXT_MENU_ID.FOR_SELECTION,
      bondIds: bonds,
      atomIds: atoms,
    };
  }
}
