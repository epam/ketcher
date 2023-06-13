import { useSelector } from 'react-redux'

import { AbbreviationLookup } from './AbbreviationLookup'
import { useOptions } from './hooks/useOptions'

import { selectIsAbbreviationLookupOpen } from '../../state/abbreviationLookup/selectors/selectors'

export const AbbreviationLookupContainer = () => {
  const isOpen = useSelector(selectIsAbbreviationLookupOpen)
  const abbreviationOptions = useOptions()

  if (!isOpen) {
    return null
  }

  return <AbbreviationLookup options={abbreviationOptions} />
}
