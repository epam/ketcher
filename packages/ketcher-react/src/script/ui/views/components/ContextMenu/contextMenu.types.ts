import type { PredicateParams, SubMenuProps } from 'react-contexify'

export type ItemData =
  | 'for-one-functional-group'
  | 'for-one-bond'
  | 'for-one-atom'
  | 'for-bonds-and-atoms-in-selection'
  | 'for-functional-groups-in-selection'

export type ContextMenuShowProps = {
  itemData: ItemData
  closestItem?: any
}

export type CustomItemProps = {
  data: ItemData
  hidden: (args: PredicateParams<ContextMenuShowProps, ItemData>) => boolean
}
export type CustomSubMenuProps = Omit<SubMenuProps, 'children' | 'label'>
