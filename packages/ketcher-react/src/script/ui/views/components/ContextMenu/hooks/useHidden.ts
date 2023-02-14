import { ItemData, ItemEventParams } from '../contextMenu.types'

// Menu.Item has prop `data`,
// whereas Menu.SubMenu doesn't have,
// so avoid to fetch `data` from `params: itemEventParams`
const useHidden = (data: ItemData) => {
  const isHidden = ({ props }: ItemEventParams) => {
    return props?.type !== data
  }

  return isHidden
}

export default useHidden
