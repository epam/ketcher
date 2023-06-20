/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import {
  AbbreviationGenericOption,
  AbbreviationOption
} from './AbbreviationLookup.types'
import { FilterOptionsState } from '@mui/material'

export const getStringsSimilarity = (
  loweredText?: string,
  loweredSubString?: string
): number => {
  if (!loweredText || !loweredSubString) {
    return 0
  }

  return loweredText.includes(loweredSubString)
    ? loweredSubString.length / loweredText.length
    : 0
}

const getHighlightSearchStartIndex = (
  option: AbbreviationGenericOption,
  loweredLookupValue: string
): number => {
  if (
    !option.loweredAbbreviation ||
    option.loweredAbbreviation === option.loweredName
  ) {
    return 0
  }

  const nameStartsWith = option.loweredName.startsWith(loweredLookupValue)
  const abbreviationStartsWith =
    option.loweredAbbreviation.startsWith(loweredLookupValue)

  if (nameStartsWith && !abbreviationStartsWith) {
    return option.loweredAbbreviation.length
  } else if (!nameStartsWith && abbreviationStartsWith) {
    return 0
  }

  const nameSimilarity = getStringsSimilarity(
    option.loweredName,
    loweredLookupValue
  )
  const abbreviationSimilarity = getStringsSimilarity(
    option.loweredAbbreviation,
    loweredLookupValue
  )

  return abbreviationSimilarity >= nameSimilarity
    ? 0
    : option.loweredAbbreviation.length
}

export const highlightOptionLabel = (
  option: AbbreviationGenericOption,
  loweredLookupValue: string
) => {
  const searchFromIndex = getHighlightSearchStartIndex(
    option,
    loweredLookupValue
  )
  const startPos = option.loweredLabel.indexOf(
    loweredLookupValue,
    searchFromIndex
  )
  if (startPos === -1) {
    return option.label
  }

  const endPos = startPos + loweredLookupValue.length
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
  if (!loweredLookupValue) {
    return 0
  }

  const nameSimilarity = getStringsSimilarity(
    option.loweredName,
    loweredLookupValue
  )
  const abbreviationSimilarity = getStringsSimilarity(
    option.loweredAbbreviation,
    loweredLookupValue
  )

  return Math.max(nameSimilarity, abbreviationSimilarity)
}

export const filterOptions = (
  options: AbbreviationOption[],
  state: FilterOptionsState<AbbreviationOption>
): AbbreviationOption[] => {
  if (!state.inputValue) {
    return []
  }

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
      } else if (optionASimilarity < optionBSimilarity) {
        return 1
      } else {
        return optionA.loweredLabel < optionB.loweredLabel ? -1 : 1
      }
    }
  })

  return filteredOptions
}
