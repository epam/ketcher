import { AttachmentPointsToBonds } from 'ketcher-core';

export const getConnectedAttachmentPoints = (
  bonds: AttachmentPointsToBonds,
) => {
  return Object.entries(bonds)
    .filter(([_, bond]) => Boolean(bond))
    .map(([attachmentPoint]) => attachmentPoint);
};
