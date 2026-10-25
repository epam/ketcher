import type { AttachmentPointName, FunctionalGroup } from 'ketcher-core';
import type { TriggerEvent, PredicateParams } from 'react-contexify';
import type { Selection } from '../../../../editor/Editor';

export enum CONTEXT_MENU_ID {
  FOR_BONDS = 'context-menu-for-bonds',
  FOR_ATOMS = 'context-menu-for-atoms',
  FOR_ATTACHMENT_GROUP = 'context-menu-for-attachment-group',
  FOR_SELECTION = 'context-menu-for-selection',
  FOR_FUNCTIONAL_GROUPS = 'context-menu-for-functional-groups',
  FOR_R_GROUP_ATTACHMENT_POINT = 'context-menu-for-rgroup-attachment-point',
  FOR_MULTITAIL_ARROW = 'context-menu-for-multiple-arrowed',
  FOR_MACROMOLECULE = 'context-menu-for-macromolecule',
  FOR_ATTACHMENT_POINT_LABEL = 'context-menu-for-attachment-point-label',
}

interface BaseContextMenuProperties {
  id: string;
}

interface WithExtraItems {
  extraItemsSelected?: boolean;
}

export interface BondsContextMenuProperties
  extends BaseContextMenuProperties, WithExtraItems {
  id: string;
  bondIds: Array<number>;
}

export interface AtomContextMenuProperties
  extends BaseContextMenuProperties, WithExtraItems {
  id: string;
  atomIds: Array<number>;
  attachmentGroupIds?: Array<number>;
}

export interface AttachmentGroupContextMenuProperties extends BaseContextMenuProperties {
  id: string;
  attachmentGroupIds: Array<number>;
}

export interface RGroupAttachmentPointContextMenuProperties
  extends BaseContextMenuProperties, WithExtraItems {
  id: string;
  rgroupAttachmentPoints: Array<number>;
  atomIds?: AtomContextMenuProperties['atomIds'];
}
export interface SelectionContextMenuProperties
  extends
    BaseContextMenuProperties,
    Partial<Pick<BondsContextMenuProperties, 'bondIds'>>,
    Partial<Pick<AtomContextMenuProperties, 'atomIds'>>,
    Partial<
      Pick<RGroupAttachmentPointContextMenuProperties, 'rgroupAttachmentPoints'>
    > {
  id: string;
  attachmentGroupIds?: Array<number>;
}

export interface FunctionalGroupsContextMenuProperties extends BaseContextMenuProperties {
  id: string;
  functionalGroups: FunctionalGroup[];
}

export interface MacromoleculeContextMenuProperties extends BaseContextMenuProperties {
  id: string;
  functionalGroups: FunctionalGroup[];
  /** Total count of monomers on canvas with the same code as the primary monomer */
  totalMonomerCount?: number;
  /** True when the selection contains at least one non-monomer chemical structure element */
  hasNonMonomerStructure?: boolean;
}

export interface MultitailArrowContextMenuProperties {
  id: string;
  itemId: number;
  tailId: number | null;
}

export interface AttachmentPointLabelContextMenuProperties extends BaseContextMenuProperties {
  id: string;
  attachmentPointName: AttachmentPointName;
}

export type ContextMenuProperties =
  | BondsContextMenuProperties
  | AtomContextMenuProperties
  | AttachmentGroupContextMenuProperties
  | SelectionContextMenuProperties
  | FunctionalGroupsContextMenuProperties
  | RGroupAttachmentPointContextMenuProperties
  | MultitailArrowContextMenuProperties
  | MacromoleculeContextMenuProperties
  | AttachmentPointLabelContextMenuProperties;

export interface MenuItemsProperties<T extends ContextMenuProperties> {
  triggerEvent?: TriggerEvent;
  propsFromTrigger?: T;
}

export type ItemEventParameters<
  T extends ContextMenuProperties = ContextMenuProperties,
> = PredicateParams<T, unknown>;

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

export interface GetIsItemInSelectionArguments {
  item: ClosestItem | null;
  selection: Selection | null;
  selectedFunctionalGroups: Map<number, FunctionalGroup>;
  selectedSGroupsIds: Set<number>;
}
