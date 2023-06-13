import { AbbreviationOption } from './AbbreviationLookup.types'

export const highlightMatchedText = (
  option: AbbreviationOption,
  loweredInputValue: string
) => {
  const startPos = option.loweredName.indexOf(loweredInputValue)
  if (startPos === -1) {
    return option.name
  }

  const endPos = startPos + loweredInputValue.length
  const startPart = option.name.substring(0, startPos)
  const middlePart = option.name.substring(startPos, endPos)
  const endPart = option.name.substring(endPos)

  return (
    <>
      {startPart}
      <mark>{middlePart}</mark>
      {endPart}
    </>
  )
}

export const getOptionLabel = (option: AbbreviationOption): string => {
  return option.name
}
