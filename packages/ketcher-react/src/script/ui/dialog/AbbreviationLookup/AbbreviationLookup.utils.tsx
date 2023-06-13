import { AbbreviationOption } from './AbbreviationLookup.types'

export const highlightMatchedText = (text: string, inputValue: string) => {
  const startPos = text.toLowerCase().indexOf(inputValue.toLowerCase())
  if (startPos === -1) {
    return text
  }

  const endPos = startPos + inputValue.length
  const startPart = text.substring(0, startPos)
  const middlePart = text.substring(startPos, endPos)
  const endPart = text.substring(endPos)

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
