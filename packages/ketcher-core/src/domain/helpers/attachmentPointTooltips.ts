import { KetMonomerClass } from 'domain/constants/monomers';
import { AttachmentPointName } from 'domain/types';

export function getAttachmentPointTooltip(
  monomerClass: KetMonomerClass | 'rnaPreset' | undefined,
  ap: AttachmentPointName,
): string | null | undefined {
  const isTargetClass =
    monomerClass === KetMonomerClass.Sugar ||
    monomerClass === KetMonomerClass.Phosphate ||
    monomerClass === KetMonomerClass.RNA;

  if (!isTargetClass) return undefined;

  if (ap === AttachmentPointName.R1) return "5'";
  if (ap === AttachmentPointName.R2) return "3'";

  return undefined;
}
