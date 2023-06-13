import {
  AbbreviationGenericOption,
  AbbreviationOption
} from './AbbreviationLookup.types'
import { FilterOptionsState } from '@mui/base/AutocompleteUnstyled/useAutocomplete'

export const highlightMatchedText = (
  option: AbbreviationGenericOption,
  loweredInputValue: string
) => {
  const startPos = option.loweredLabel.indexOf(loweredInputValue)
  if (startPos === -1) {
    return option.label
  }

  const endPos = startPos + loweredInputValue.length
  const startPart = option.label.substring(0, startPos)
  const middlePart = option.label.substring(startPos, endPos)
  const endPart = option.label.substring(endPos)

  return (
    <>
      {startPart}
      <mark>{middlePart}</mark>
      {endPart}
    </>
  )
}

export const getOptionLabel = (option: AbbreviationGenericOption): string => {
  return option.label
}

export const getSimilarity = (
  option: AbbreviationGenericOption,
  loweredLookupValue: string
): number => {
  const lookupValueLength = loweredLookupValue.length

  if (!lookupValueLength) {
    return 0
  }

  const nameSimilarity = option.loweredName.includes(loweredLookupValue)
    ? lookupValueLength / option.loweredName.length
    : 0
  const abbreviationSimilarity = option.loweredAbbreviation?.includes(
    loweredLookupValue
  )
    ? lookupValueLength / option.loweredAbbreviation.length
    : 0

  return Math.max(nameSimilarity, abbreviationSimilarity)
}

export const filterOptions = (
  options: AbbreviationOption[],
  state: FilterOptionsState<AbbreviationOption>
): AbbreviationOption[] => {
  const loweredLookupValue = state.inputValue.toLowerCase()

  const filteredOptions = options.filter((option) => {
    return (
      option.loweredName.includes(loweredLookupValue) ||
      (option.loweredAbbreviation &&
        option.loweredAbbreviation.includes(loweredLookupValue))
    )
  })

  filteredOptions.sort((optionA, optionB) => {
    const optionAStartWith =
      optionA.loweredName.startsWith(loweredLookupValue) ||
      optionA.loweredAbbreviation?.startsWith(loweredLookupValue)
    const optionBStartWith =
      optionB.loweredName.startsWith(loweredLookupValue) ||
      optionB.loweredAbbreviation?.startsWith(loweredLookupValue)

    if (optionAStartWith && !optionBStartWith) {
      return -1
    } else if (!optionAStartWith && optionBStartWith) {
      return 1
    } else {
      const optionASimilarity = getSimilarity(optionA, loweredLookupValue)
      const optionBSimilarity = getSimilarity(optionB, loweredLookupValue)

      if (optionASimilarity > optionBSimilarity) {
        return -1
      } else {
        return optionA.loweredLabel < optionB.loweredLabel ? -1 : 1
      }
    }
  })

  return filteredOptions
}
