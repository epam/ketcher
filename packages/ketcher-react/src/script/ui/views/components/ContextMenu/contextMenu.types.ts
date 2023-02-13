import { FunctionalGroup } from 'ketcher-core'
import type { PredicateParams } from 'react-contexify'

export type ItemData =
  | 'for-bonds'
  | 'for-atoms'
  | 'for-functional-groups'
  | 'for-selection'

export type ContextMenuShowProps = {
  type: ItemData
  functionalGroups?: FunctionalGroup[]
  bondIds?: number[]
  atomIds?: number[]
}

export type ItemEventParams = PredicateParams<ContextMenuShowProps, ItemData>

export interface CustomItemProps {
  data: ItemData
}
