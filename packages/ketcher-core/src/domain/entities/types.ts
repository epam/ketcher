import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import type {
  KetAmbiguousMonomerTemplateSubType,
  KetMonomerClass,
} from 'application/formatters/types/ket';

export interface IVariantMonomer {
  monomers: BaseMonomer[];
  monomerClass: KetMonomerClass;
  subtype: KetAmbiguousMonomerTemplateSubType;
}

export enum AtomCIP {
  S = 'S',
  R = 'R',
  s = 's',
  r = 'r',
  // Stereocenter without stereo bonds: configuration is not defined.
  // Display-only label, never serialized to KET.
  Undefined = '?',
}

export enum BondCIP {
  E = 'E',
  Z = 'Z',
  M = 'M',
  P = 'P',
}
