import { useSelector } from 'react-redux'
import { selectIsAbbreviationLookupOpen } from '../../state/abbreviationLookup/selectors/selectors'
import { AbbreviationLookup } from './AbbreviationLookup'

export const AbbreviationLookupContainer = () => {
  const isOpen = useSelector(selectIsAbbreviationLookupOpen)
  if (!isOpen) {
    return null
  }

  return <AbbreviationLookup />
}
