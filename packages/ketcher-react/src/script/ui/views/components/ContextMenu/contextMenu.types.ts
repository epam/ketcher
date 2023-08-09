import { FunctionalGroup } from 'ketcher-core';
import type { TriggerEvent, PredicateParams } from 'react-contexify';
import { Selection } from '../../../../editor/Editor';

export enum CONTEXT_MENU_ID {
  FOR_BONDS = 'context-menu-for-bonds',
  FOR_ATOMS = 'context-menu-for-atoms',
  FOR_SELECTION = 'context-menu-for-selection',
  FOR_FUNCTIONAL_GROUPS = 'context-menu-for-functional-groups',
  FOR_R_GROUP_ATTACHMENT_POINT = 'context-menu-for-rgroup-attachment-point',
}

export type ItemData = unknown;

export type ContextMenuShowProps = {
  id: CONTEXT_MENU_ID;
  functionalGroups?: FunctionalGroup[];
  bondIds?: number[];
  atomIds?: number[];
  extraItemsSelected?: boolean;
  rgroupAttachmentPoints?: number[];
} | null;

export interface MenuItemsProps {
  triggerEvent?: TriggerEvent;
  propsFromTrigger?: ContextMenuShowProps;
}

export type ItemEventParams = PredicateParams<ContextMenuShowProps, ItemData>;

export type contextMenuInfo = {
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
  map: string /* should be enum something like keys of findMaps from packages/ketcher-react/src/script/editor/shared/closest.js */;
}

export interface GetIsItemInSelectionArgs {
  item: ClosestItem | null;
  selection: Selection | null;
  selectedFunctionalGroups: Map<number, FunctionalGroup>;
  selectedSGroupsIds: Set<number>;
}
