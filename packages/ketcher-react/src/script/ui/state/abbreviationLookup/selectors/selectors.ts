export const selectIsAbbreviationLookupOpen = (state): boolean =>
  state.abbreviationLookup.isOpen

export const selectAbbreviationLookupValue = (state): string =>
  state.abbreviationLookup.lookupValue ?? ''
