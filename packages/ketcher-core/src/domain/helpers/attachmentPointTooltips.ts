import { KetMonomerClass } from 'application/formatters/types/ket';
import { AttachmentPointName } from 'domain/types';
import { RnaPresetComponentType } from 'application/render/raphaelRender';

export function getAttachmentPointTooltip(
  monomerClass: KetMonomerClass | 'rnaPreset' | undefined,
  ap: AttachmentPointName,
  presetComponentType?: RnaPresetComponentType,
): string | null {
  // For RNA presets, use the component type for tooltip determination
  if (monomerClass === 'rnaPreset' && presetComponentType) {
    // R1 of sugar shows 5'
    if (presetComponentType === 'sugar' && ap === AttachmentPointName.R1) {
      return "5'";
    }
    // R2 of phosphate shows 3'
    if (presetComponentType === 'phosphate' && ap === AttachmentPointName.R2) {
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
