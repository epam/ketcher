import {
  BaseMonomer,
  Chem,
  Peptide,
  Phosphate,
  RNABase,
  Struct,
  Sugar,
  PolymerBond,
} from 'domain/entities';
import {
  IKetAttachmentPoint,
  IKetIdtAliases,
  KetAmbiguousMonomerTemplateOption,
  KetAmbiguousMonomerTemplateSubType,
  KetMonomerClass,
} from 'application/formatters/types/ket';
import { D3SvgElementSelection } from 'application/render/types';
import { UsageInMacromolecule } from 'application/render';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';
import { FlipDirection } from 'application/editor';

export type MonomerColorScheme = {
  regular: string;
  hover: string;
};

export enum AttachmentPointName {
  R1 = 'R1',
  R2 = 'R2',
  R3 = 'R3',
  R4 = 'R4',
  R5 = 'R5',
  R6 = 'R6',
  R7 = 'R7',
  R8 = 'R8',
  HYDROGEN = 'hydrogen',
}

export type MonomerItemBase = {
  label: string;
  isAmbiguous?: boolean;
  favorite?: boolean;
  transformation?: Partial<{
    shift: Partial<{
      x: number;
      y: number;
    }>;
  }>;
};

export type MonomerItemType = MonomerItemBase & {
  colorScheme?: MonomerColorScheme;
  struct: Struct;
  props: {
    id?: string;
    MonomerNaturalAnalogCode: string;
    MonomerName: string;
    MonomerFullName?: string;
    Name: string;
    // TODO determine whenever these props are optional or not
    BranchMonomer?: string;
    MonomerCaps?: Partial<Record<AttachmentPointName, string>>;
    MonomerCode?: string;
    MonomerType?: string;
    MonomerClass?: KetMonomerClass;
    isMicromoleculeFragment?: boolean;
    idtAliases?: IKetIdtAliases;
    unresolved?: boolean;
  };
  attachmentPoints?: IKetAttachmentPoint[];
  seqId?: number;
  isAntisense?: boolean;
  isSense?: boolean;
  expanded?: boolean;
  transformation?: Partial<{
    rotation?: number;
    flip?: FlipDirection;
  }>;
};

export type AmbiguousMonomerType = MonomerItemBase & {
  id: string;
  monomers: BaseMonomer[];
  subtype: KetAmbiguousMonomerTemplateSubType;
  options: KetAmbiguousMonomerTemplateOption[];
  idtAliases?: IKetIdtAliases;
  isAmbiguous: true;
};

export type MonomerOrAmbiguousType = MonomerItemType | AmbiguousMonomerType;

export const attachmentPointNames = [
  'R1',
  'R2',
  'R3',
  'R4',
  'R5',
  'R6',
  'R7',
  'R8',
];

export type LeavingGroup = 'O' | 'OH' | 'H';

export type AttachmentPointConstructorParams = {
  rootElement: D3SvgElementSelection<SVGGElement, void>;
  monomer: BaseMonomer;
  bodyWidth: number;
  bodyHeight: number;
  canvas: D3SvgElementSelection<SVGSVGElement, void>;
  attachmentPointName: AttachmentPointName;
  isUsed: boolean;
  isPotentiallyUsed: boolean;
  angle: number;
  isSnake: boolean;
  applyZoomForPositionCalculation: boolean;
};

export type PreviewAttachmentPointConstructorParams =
  AttachmentPointConstructorParams & {
    selected: boolean;
    connected: boolean;
    usage: UsageInMacromolecule;
  };

export type ConcreteMonomer = Peptide | Sugar | RNABase | Phosphate | Chem;

export type AttachmentPointsToBonds = Partial<
  Record<AttachmentPointName, PolymerBond | MonomerToAtomBond | null>
>;
