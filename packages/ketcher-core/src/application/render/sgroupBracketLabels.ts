import { type SGroup, SUPERATOM_CLASS } from 'domain/entities/sgroup';

export interface SGroupBracketLabels {
  lowerIndexText?: string | null;
  upperIndexText?: string | null;
  indexAttribute?: Record<string, string>;
  superatomClass?: SUPERATOM_CLASS;
}

export function getSGroupBracketLabels(sgroup: SGroup): SGroupBracketLabels {
  switch (sgroup.type) {
    case 'MUL':
      return { lowerIndexText: String(sgroup.data.mul) };
    case 'SRU': {
      const connectivity = sgroup.data.connectivity || 'eu';
      return {
        lowerIndexText: sgroup.data.subscript || 'n',
        upperIndexText: connectivity === 'ht' ? '' : connectivity,
      };
    }
    case 'COP':
      return {
        lowerIndexText: sgroup.data.subtype,
        upperIndexText: sgroup.data.connectivity || 'eu',
      };
    case 'SUP':
      return {
        lowerIndexText: sgroup.superatomLabel,
        indexAttribute: { 'font-style': 'italic' },
        superatomClass: Object.values(SUPERATOM_CLASS).find(
          (value) => value === sgroup.data.class,
        ),
      };
    default:
      return {};
  }
}
