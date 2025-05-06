import { BaseMonomer } from 'domain/entities/BaseMonomer';
import {
  KetAmbiguousMonomerTemplateSubType,
  KetMonomerClass,
} from 'application/formatters';

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
}

export enum BondCIP {
  E = 'E',
  Z = 'Z',
  M = 'M',
  P = 'P',
}
