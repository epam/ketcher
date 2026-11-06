import type { AttachmentPointName } from 'ketcher-core';

export function computeFinalApNames(
  assignedApNames: AttachmentPointName[],
  pendingRenames: Map<AttachmentPointName, AttachmentPointName>,
): AttachmentPointName[] {
  return assignedApNames.map((name) => pendingRenames.get(name) ?? name);
}

export function hasDuplicateApNames(names: AttachmentPointName[]): boolean {
  return new Set(names).size !== names.length;
}
