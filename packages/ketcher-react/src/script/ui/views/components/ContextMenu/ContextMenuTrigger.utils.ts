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
  ketcherId: string,
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

      const noFunctionalGroup =
        functionalGroup === null ||
        functionalGroup?.relatedSGroup.isSuperatomWithoutLabel;
      const isMonomer =
        functionalGroup?.relatedSGroup instanceof MonomerMicromolecule;

      if (noFunctionalGroup) {
        return {
          id: CONTEXT_MENU_ID.FOR_BONDS + ketcherId,
          bondIds: [closestItem.id],
        };
      } else if (isMonomer) {
        return {
          id: CONTEXT_MENU_ID.FOR_MACROMOLECULE + ketcherId,
          functionalGroups: [functionalGroup],
        };
      } else {
        return {
          id: CONTEXT_MENU_ID.FOR_FUNCTIONAL_GROUPS + ketcherId,
          functionalGroups: [functionalGroup],
        };
      }
    }

    case 'atoms': {
      const functionalGroup = FunctionalGroup.findFunctionalGroupByAtom(
        struct.functionalGroups,
        closestItem.id,
        true,
      );

      const noFunctionalGroup =
        functionalGroup === null ||
        functionalGroup?.relatedSGroup.isSuperatomWithoutLabel;
      const isMonomer =
        functionalGroup?.relatedSGroup instanceof MonomerMicromolecule;

      if (noFunctionalGroup) {
        return {
          id: CONTEXT_MENU_ID.FOR_ATOMS + ketcherId,
          atomIds: [closestItem.id],
        };
      } else if (isMonomer) {
        return {
          id: CONTEXT_MENU_ID.FOR_MACROMOLECULE + ketcherId,
          functionalGroups: [functionalGroup],
        };
      } else {
        return {
          id: CONTEXT_MENU_ID.FOR_FUNCTIONAL_GROUPS + ketcherId,
          functionalGroups: [functionalGroup],
        };
      }
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
            id:
              sGroup instanceof MonomerMicromolecule
                ? CONTEXT_MENU_ID.FOR_MACROMOLECULE + ketcherId
                : CONTEXT_MENU_ID.FOR_FUNCTIONAL_GROUPS + ketcherId,
            functionalGroups: [functionalGroup],
          }
        : null;
    }

    case 'rgroupAttachmentPoints': {
      const atomId = struct.rgroupAttachmentPoints.get(closestItem.id)?.atomId;

      return {
        id: CONTEXT_MENU_ID.FOR_R_GROUP_ATTACHMENT_POINT + ketcherId,
        rgroupAttachmentPoints: [closestItem.id],
        atomIds: typeof atomId === 'number' ? [atomId] : undefined,
      };
    }

    case MULTITAIL_ARROW_KEY: {
      const closestItemTyped = closestItem as unknown as ReturnType<
        ReMultitailArrow['calculateDistanceToPoint']
      >;
      const tailId = closestItemTyped?.ref?.tailId;
      return {
        id: CONTEXT_MENU_ID.FOR_MULTITAIL_ARROW + ketcherId,
        itemId: closestItem.id,
        tailId: typeof tailId === 'number' ? tailId : null,
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
  ketcherId: string,
): ContextMenuProps | null {
  if (!selection) {
    return null;
  }

  const { bonds, atoms, rgroupAttachmentPoints } = selection;

  if (selectedFunctionalGroups.size > 0) {
    const functionalGroups = Array.from(selectedFunctionalGroups.values());
    if (
      functionalGroups.some(
        (fg) => fg.relatedSGroup instanceof MonomerMicromolecule,
      )
    ) {
      return {
        id: CONTEXT_MENU_ID.FOR_MACROMOLECULE + ketcherId,
        functionalGroups,
      };
    }

    return {
      id: CONTEXT_MENU_ID.FOR_FUNCTIONAL_GROUPS + ketcherId,
      functionalGroups,
    };
  } else if (bonds && !atoms && !rgroupAttachmentPoints) {
    return {
      id: CONTEXT_MENU_ID.FOR_BONDS + ketcherId,
      bondIds: bonds,
      extraItemsSelected: !onlyHasProperty(
        selection,
        'bonds',
        IGNORED_MAPS_LIST,
      ),
    };
  } else if (atoms && !bonds && !rgroupAttachmentPoints) {
    return {
      id: CONTEXT_MENU_ID.FOR_ATOMS + ketcherId,
      atomIds: atoms,
      extraItemsSelected: !onlyHasProperty(
        selection,
        'atoms',
        IGNORED_MAPS_LIST,
      ),
    };
  } else if (rgroupAttachmentPoints && !bonds && !atoms) {
    return {
      id: CONTEXT_MENU_ID.FOR_R_GROUP_ATTACHMENT_POINT + ketcherId,
      rgroupAttachmentPoints,
      extraItemsSelected: !onlyHasProperty(
        selection,
        'rgroupAttachmentPoints',
        IGNORED_MAPS_LIST,
      ),
    };
  } else {
    return {
      id: CONTEXT_MENU_ID.FOR_SELECTION + ketcherId,
      bondIds: bonds,
      atomIds: atoms,
      rgroupAttachmentPoints,
    };
  }
}
