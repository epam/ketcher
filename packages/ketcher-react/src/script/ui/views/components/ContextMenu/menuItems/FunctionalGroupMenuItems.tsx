import { Item } from 'react-contexify'
import { CustomItemProps } from '../contextMenu.types'
import useFunctionalGroupEoc from '../hooks/useFunctionalGroupEoc'
import useFunctionalGroupRemove from '../hooks/useFunctionalGroupRemove'
import useHidden from '../hooks/useHidden'

const FunctionalGroupMenuItems: React.FC<CustomItemProps> = (props) => {
  const hidden = useHidden(props.data)
  const [handleExpandOrContract, ExpandOrContractHidden] =
    useFunctionalGroupEoc(props.data)
  const handleRemove = useFunctionalGroupRemove()

  // @yulei need to document
  // 1. lowercase abbreviation
  // 2. disabled not hidden
  return (
    <>
      <Item
        {...props}
        hidden={hidden}
        disabled={(params) => ExpandOrContractHidden(params, true)}
        onClick={(params) => handleExpandOrContract(params, true)}
      >
        Expand abbreviation
      </Item>
      <Item
        {...props}
        hidden={hidden}
        disabled={(params) => ExpandOrContractHidden(params, false)}
        onClick={(params) => handleExpandOrContract(params, false)}
      >
        Contract abbreviation
      </Item>
      <Item {...props} hidden={hidden} onClick={handleRemove}>
        Remove abbreviation
      </Item>
    </>
  )
}

export default FunctionalGroupMenuItems
