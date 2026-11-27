function castAtomPropToType(property, value) {
  const typesMapping = {
    exactChangeFlag: Number,
    unsaturatedAtom: Number,
  };
  return typesMapping[property] ? typesMapping[property](value) : value;
}

export function updateOnlyChangedProperties(
  unchangedElement,
  userChangedElement,
) {
  const updatedKeys = new Set(
    Object.getOwnPropertyNames(userChangedElement).filter(
      (key) => userChangedElement[key] !== '',
    ),
  );
  return Object.getOwnPropertyNames(unchangedElement).reduce(
    (updatedElement, key) => {
      updatedElement[key] = updatedKeys.has(key)
        ? castAtomPropToType(key, userChangedElement[key])
        : unchangedElement[key];
      return updatedElement;
    },
    {},
  );
}
