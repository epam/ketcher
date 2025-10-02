import { AttachmentPointName, FunctionalGroup } from 'ketcher-core';
import type { TriggerEvent, PredicateParams } from 'react-contexify';
import { Selection } from '../../../../editor/Editor';

export enum CONTEXT_MENU_ID {
  FOR_BONDS = 'context-menu-for-bonds',
  FOR_ATOMS = 'context-menu-for-atoms',
  FOR_SELECTION = 'context-menu-for-selection',
  FOR_FUNCTIONAL_GROUPS = 'context-menu-for-functional-groups',
  FOR_R_GROUP_ATTACHMENT_POINT = 'context-menu-for-rgroup-attachment-point',
  FOR_MULTITAIL_ARROW = 'context-menu-for-multiple-arrowed',
  FOR_MACROMOLECULE = 'context-menu-for-macromolecule',
  FOR_ATTACHMENT_POINT_LABEL = 'context-menu-for-attachment-point-label',
}

export type ItemData = unknown;

interface BaseContextMenuProps {
  id: string;
}

interface WithExtraItems {
  extraItemsSelected?: boolean;
}

export interface BondsContextMenuProps
  extends BaseContextMenuProps,
    WithExtraItems {
  id: string;
  bondIds: Array<number>;
}

export interface AtomContextMenuProps
  extends BaseContextMenuProps,
    WithExtraItems {
  id: string;
  atomIds: Array<number>;
}

export interface RGroupAttachmentPointContextMenuProps
  extends BaseContextMenuProps,
    WithExtraItems {
  id: string;
  rgroupAttachmentPoints: Array<number>;
  atomIds?: AtomContextMenuProps['atomIds'];
}
export interface SelectionContextMenuProps
  extends BaseContextMenuProps,
    Partial<Pick<BondsContextMenuProps, 'bondIds'>>,
    Partial<Pick<AtomContextMenuProps, 'atomIds'>>,
    Partial<
      Pick<RGroupAttachmentPointContextMenuProps, 'rgroupAttachmentPoints'>
    > {
  id: string;
}

export interface FunctionalGroupsContextMenuProps extends BaseContextMenuProps {
  id: string;
  functionalGroups: FunctionalGroup[];
}

export interface MacromoleculeContextMenuProps extends BaseContextMenuProps {
  id: string;
  functionalGroups: FunctionalGroup[];
}

export interface MultitailArrowContextMenuProps {
  id: string;
  itemId: number;
  tailId: number | null;
}

export interface AttachmentPointLabelContextMenuProps
  extends BaseContextMenuProps {
  id: string;
  attachmentPointName: AttachmentPointName;
}

export type ContextMenuProps =
  | BondsContextMenuProps
  | AtomContextMenuProps
  | SelectionContextMenuProps
  | FunctionalGroupsContextMenuProps
  | RGroupAttachmentPointContextMenuProps
  | MultitailArrowContextMenuProps
  | MacromoleculeContextMenuProps
  | AttachmentPointLabelContextMenuProps;

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
  AuxiliaryItem = 'auxiliaryItem',
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
