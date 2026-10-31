import { KetMonomerClass } from 'domain/constants/monomers';
import { AttachmentPointName } from 'domain/types';
import type { RnaPresetComponentKey } from 'application/editor/shared/customEvents';

export function getAttachmentPointTooltip(
  monomerClass: KetMonomerClass | 'rnaPreset' | undefined,
  ap: AttachmentPointName,
  rnaComponentKey?: RnaPresetComponentKey,
): string | null {
  if (monomerClass === 'rnaPreset') {
    if (rnaComponentKey === 'sugar' && ap === AttachmentPointName.R1) {
      return "5'";
    }
    if (rnaComponentKey === 'phosphate' && ap === AttachmentPointName.R2) {
      return "3'";
    }

    return null;
  }

  const isTargetClass =
    monomerClass === KetMonomerClass.Sugar ||
    monomerClass === KetMonomerClass.Phosphate ||
    monomerClass === KetMonomerClass.RNA;

  if (!isTargetClass) return null;

  if (ap === AttachmentPointName.R1) return "5'";
  if (ap === AttachmentPointName.R2) return "3'";

  return null;
}
