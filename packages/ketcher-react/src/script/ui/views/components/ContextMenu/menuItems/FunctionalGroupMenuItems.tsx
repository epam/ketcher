import { FC } from 'react'
import { Item } from 'react-contexify'
import useFunctionalGroupEoc from '../hooks/useFunctionalGroupEoc'
import useFunctionalGroupRemove from '../hooks/useFunctionalGroupRemove'
import { MenuItemsProps } from '../contextMenu.types'

const FunctionalGroupMenuItems: FC<MenuItemsProps> = (props) => {
  const [
    handleExpandOrContract,
    ExpandOrContractHidden,
    ExpandOrContractDisabled
  ] = useFunctionalGroupEoc()
  const handleRemove = useFunctionalGroupRemove()

  return (
    <>
      <Item
        {...props}
        disabled={(params) => ExpandOrContractDisabled(params)}
        hidden={(params) => ExpandOrContractHidden(params, true)}
        onClick={(params) => handleExpandOrContract(params, true)}
      >
        Expand Abbreviation
      </Item>
      <Item
        {...props}
        disabled={(params) => ExpandOrContractDisabled(params)}
        hidden={(params) => ExpandOrContractHidden(params, false)}
        onClick={(params) => handleExpandOrContract(params, false)}
      >
        Contract Abbreviation
      </Item>
      <Item {...props} onClick={handleRemove}>
        Remove Abbreviation
      </Item>
    </>
  )
}

export default FunctionalGroupMenuItems
