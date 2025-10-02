/**
 * Helper function to remove slashes from IDT alias strings for preview display.
 * IDT aliases are stored with slashes (e.g., "/3Phos/", "/5Phos/") but should be
 * displayed without slashes in the preview (e.g., "3Phos", "5Phos").
 *
 * @param alias - The IDT alias string that may contain leading/trailing slashes
 * @returns The alias string with leading and trailing slashes removed
 */
export const removeSlashesFromIdtAlias = (
  alias: string | undefined,
): string | undefined => {
  if (!alias) return alias;
  return alias.replace(/^\/+|\/+$/g, '');
};
