import { Atom, Bond } from 'ketcher-core'

type partialPropertiesOfElement = Partial<{
  [attribute in keyof (Atom | Bond)]: string | number | boolean
}>

// If all elements have the same value, then this value is used as a baseline
// otherwise it is set to an empty string. Afterwards, empty string denotes that the value is not changed
export function generateCommonProperties(
  selectedElements: Atom[] | Bond[],
  normalizedElement
): partialPropertiesOfElement {
  const properties = Object.getOwnPropertyNames(normalizedElement)
  const resultElementAttributes: partialPropertiesOfElement = {}
  properties.forEach((property) => {
    const uniqueValues = new Set()
    selectedElements.forEach((element) => {
      uniqueValues.add(element[property])
    })
    const allElementsHaveTheSameValue = uniqueValues.size === 1
    if (allElementsHaveTheSameValue) {
      resultElementAttributes[property] = normalizedElement[property]
    } else {
      resultElementAttributes[property] = ''
    }
  })
  return resultElementAttributes
}
