import { FunctionalGroup } from 'ketcher-core';
import type { TriggerEvent, PredicateParams } from 'react-contexify';
import { Selection } from '../../../../editor/Editor';

export enum CONTEXT_MENU_ID {
  FOR_BONDS = 'context-menu-for-bonds',
  FOR_ATOMS = 'context-menu-for-atoms',
  FOR_SELECTION = 'context-menu-for-selection',
  FOR_FUNCTIONAL_GROUPS = 'context-menu-for-functional-groups',
  FOR_R_GROUP_ATTACHMENT_POINT = 'context-menu-for-rgroup-attachment-point',
  FOR_MULTITAIL_ARROW = 'context-menu-for-multiple-arrowed',
}

export type ItemData = unknown;

interface BaseContextMenuProps {
  id: CONTEXT_MENU_ID;
}

interface WithExtraItems {
  extraItemsSelected?: boolean;
}

export interface BondsContextMenuProps
  extends BaseContextMenuProps,
    WithExtraItems {
  id: CONTEXT_MENU_ID.FOR_BONDS;
  bondIds: Array<number>;
}

export interface AtomContextMenuProps
  extends BaseContextMenuProps,
    WithExtraItems {
  id: CONTEXT_MENU_ID.FOR_ATOMS;
  atomIds: Array<number>;
}

export interface SelectionContextMenuProps
  extends BaseContextMenuProps,
    Partial<Pick<BondsContextMenuProps, 'bondIds'>>,
    Partial<Pick<AtomContextMenuProps, 'atomIds'>> {
  id: CONTEXT_MENU_ID.FOR_SELECTION;
}

export interface FunctionalGroupsContextMenuProps extends BaseContextMenuProps {
  id: CONTEXT_MENU_ID.FOR_FUNCTIONAL_GROUPS;
  functionalGroups: FunctionalGroup[];
}

export interface RGroupAttachmentPointContextMenuProps
  extends BaseContextMenuProps,
    WithExtraItems {
  id: CONTEXT_MENU_ID.FOR_R_GROUP_ATTACHMENT_POINT;
  rgroupAttachmentPoints: Array<number>;
  atomIds?: AtomContextMenuProps['atomIds'];
}

export interface MultitailArrowContextMenuProps {
  id: CONTEXT_MENU_ID.FOR_MULTITAIL_ARROW;
  itemId: number;
  tailId: number | null;
}

export type ContextMenuProps =
  | BondsContextMenuProps
  | AtomContextMenuProps
  | SelectionContextMenuProps
  | FunctionalGroupsContextMenuProps
  | RGroupAttachmentPointContextMenuProps
  | MultitailArrowContextMenuProps;

export interface MenuItemsProps<T extends ContextMenuProps> {
  triggerEvent?: TriggerEvent;
  propsFromTrigger?: T;
}

export type ItemEventParams<T extends ContextMenuProps = ContextMenuProps> =
  PredicateParams<T, ItemData>;

export type ContextMenuInfo = {
  [id in CONTEXT_MENU_ID]?: boolean;
};

export enum ContextMenuTriggerType {
  None = 'none',
  Selection = 'selection',
  ClosestItem = 'closestItem',
}

export interface ClosestItem {
  id: number;
  dist: number;
  map: string /* should be enum something like keys of findMaps from packages/ketcher-react/src/script/editor/shared/closest.ts */;
}

export interface GetIsItemInSelectionArgs {
  item: ClosestItem | null;
  selection: Selection | null;
  selectedFunctionalGroups: Map<number, FunctionalGroup>;
  selectedSGroupsIds: Set<number>;
}
