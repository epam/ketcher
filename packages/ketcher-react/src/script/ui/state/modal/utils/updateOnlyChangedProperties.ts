export function updateOnlyChangedProperties(
  unchangedElement,
  userChangedElement
) {
  const updatedKeys = Object.getOwnPropertyNames(userChangedElement).filter(
    (key) => userChangedElement[key] !== ''
  )
  return Object.getOwnPropertyNames(unchangedElement).reduce(
    (updatedElement, key) => {
      updatedElement[key] = updatedKeys.includes(key)
        ? userChangedElement[key]
        : unchangedElement[key]
      return updatedElement
    },
    {}
  )
}
