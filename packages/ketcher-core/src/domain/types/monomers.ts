import {
  BaseMonomer,
  Chem,
  Peptide,
  Phosphate,
  RNABase,
  Struct,
  Sugar,
} from 'domain/entities';
import { IKetAttachmentPoint } from 'application/formatters/types/ket';
import { D3SvgElementSelection } from 'application/render/types';

export type MonomerColorScheme = {
  regular: string;
  hover: string;
};

export type MonomerItemType = {
  label: string;
  colorScheme?: MonomerColorScheme;
  favorite?: boolean;
  struct: Struct;
  props: {
    id?: string;
    MonomerNaturalAnalogCode: string;
    MonomerName: string;
    MonomerFullName?: string;
    Name: string;
    // TODO determine whenever these props are optional or not
    BranchMonomer?: string;
    MonomerCaps?: { [key: string]: string };
    MonomerCode?: string;
    MonomerType?: string;
    MonomerClass?: string;
    isMicromoleculeFragment?: boolean;
  };
  attachmentPoints?: IKetAttachmentPoint[];
  seqId?: number;
};

export type AttachmentPointName =
  | 'R1'
  | 'R2'
  | 'R3'
  | 'R4'
  | 'R5'
  | 'R6'
  | 'R7'
  | 'R8';

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
};

export type ConcreteMonomer = Peptide | Sugar | RNABase | Phosphate | Chem;
