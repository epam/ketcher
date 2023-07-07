function castAtomPropToType(property, value) {
  const typesMapping = {
    charge: Number,
    exactChangeFlag: Number,
    unsaturatedAtom: Number,
  };
  if (typesMapping[property]) {
    return typesMapping[property](value);
  }
  return value;
}

export function updateOnlyChangedProperties(
  unchangedElement,
  userChangedElement
) {
  const updatedKeys = Object.getOwnPropertyNames(userChangedElement).filter(
    (key) => userChangedElement[key] !== ''
  );
  return Object.getOwnPropertyNames(unchangedElement).reduce(
    (updatedElement, key) => {
      updatedElement[key] = updatedKeys.includes(key)
        ? castAtomPropToType(key, userChangedElement[key])
        : unchangedElement[key];
      return updatedElement;
    },
    {}
  );
}
