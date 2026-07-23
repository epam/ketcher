export const getModificationTypeAttribute = (
  modificationTypes?: string | string[] | null,
): string | undefined => {
  if (!modificationTypes) {
    return undefined;
  }
  if (Array.isArray(modificationTypes)) {
    return modificationTypes.join(', ');
  }
  return modificationTypes;
};
