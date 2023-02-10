import { FunctionalGroup } from 'ketcher-core'
import type { PredicateParams, SubMenuProps } from 'react-contexify'

export type ItemData =
  | 'for-one-functional-group'
  | 'for-one-bond'
  | 'for-one-atom'
  | 'for-bonds-and-atoms-in-selection'
  | 'for-functional-groups-in-selection'

export type ContextMenuShowProps = {
  type: ItemData
  closestItem?: any
  functionalGroups?: FunctionalGroup[]
  functionalGroup?: FunctionalGroup
}

export type CustomItemProps = {
  data: ItemData
  hidden: (args: PredicateParams<ContextMenuShowProps, ItemData>) => boolean
}
export type CustomSubMenuProps = Omit<SubMenuProps, 'children' | 'label'>
