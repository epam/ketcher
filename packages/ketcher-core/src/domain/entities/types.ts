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
}

export enum BondCIP {
  E = 'E',
  Z = 'Z',
  M = 'M',
  P = 'P',
}

export interface SGroupData {
  mul: number;
  connectivity: string;
  name: string;
  nucleotideComponent: string;
  subscript: string;
  expanded?: boolean;
  attached: boolean;
  absolute: boolean;
  showUnits: boolean;
  nCharsToDisplay: number;
  tagChar: string;
  daspPos: number;
  fieldType: string;
  fieldName: string;
  fieldValue: string;
  units: string;
  query: string;
  queryOp: string;
  [key: string]: unknown;
}

export type AtomIdMap = Record<number, number | undefined>;
export type BondIdMap = Record<number, number[]>;
