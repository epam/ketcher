import { getNextFreeAttachmentPoint } from 'domain/helpers';
import type { AttachmentPointName } from 'domain/types';
import type { MonomerCreationState } from 'application/render';

export const getNextAttachmentPointName = (
  monomerCreationState: NonNullable<MonomerCreationState>,
  attachmentAtomId: number,
  assignedAttachmentPoints: Map<AttachmentPointName, [number, number]>,
): AttachmentPointName => {
  const component = Array.from(
    monomerCreationState.rnaComponentAtoms?.entries() ?? [],
  ).find(([, componentData]) => componentData.atoms.includes(attachmentAtomId));

  if (!component) {
    const occupiedAttachmentPointNames = new Set([
      ...assignedAttachmentPoints.keys(),
      ...(monomerCreationState.connectionAttachmentPoints?.keys() ?? []),
    ]);

    return getNextFreeAttachmentPoint(Array.from(occupiedAttachmentPointNames));
  }

  const [componentKey, componentData] = component;
  const componentAtomIds = new Set(componentData.atoms);
  const assignedComponentAttachmentPointNames = Array.from(
    assignedAttachmentPoints.entries(),
  )
    .filter(([, [assignedAtomId]]) => componentAtomIds.has(assignedAtomId))
    .map(([attachmentPointName]) => attachmentPointName);
  const connectionAttachmentPointNames =
    monomerCreationState.rnaComponentConnectionAttachmentPoints
      ?.get(componentKey)
      ?.keys() ?? [];

  return getNextFreeAttachmentPoint([
    ...assignedComponentAttachmentPointNames,
    ...connectionAttachmentPointNames,
  ]);
};
