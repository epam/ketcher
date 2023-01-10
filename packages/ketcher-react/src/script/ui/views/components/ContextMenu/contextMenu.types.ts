import type { ItemProps, SubMenuProps } from 'react-contexify'

export type ContextMenuShowProps = {
  selected: boolean
  closestItem: any
}

export type ItemData = unknown
export type CustomItemProps = Omit<ItemProps, 'children'>
export type CustomSubMenuProps = Omit<SubMenuProps, 'children' | 'label'>
