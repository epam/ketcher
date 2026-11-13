function castAtomPropToType(property, value) {
  const typesMapping = {
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
  userChangedElement,
) {
  const updatedKeys = new Set(
    Object.getOwnPropertyNames(userChangedElement).filter(
      (key) => userChangedElement[key] !== '',
    ),
  );
  const updatedElement = {};
  Object.getOwnPropertyNames(unchangedElement).forEach((key) => {
    updatedElement[key] = updatedKeys.has(key)
      ? castAtomPropToType(key, userChangedElement[key])
      : unchangedElement[key];
  });
  return updatedElement;
}
