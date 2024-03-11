export interface IKetMonomerNode {
  type: 'monomer';
  id: string;
  seqid?: number;
  position: {
    x: number;
    y: number;
  };
  chemistryPosition?: { x: number; y: number };
  alias?: string;
  templateId: string;
}

export interface IKetGroupNode {
  type: 'group';
}

export type KetNode = IKetMonomerNode | IKetGroupNode;

export interface IKetConnectionEndPoint {
  monomerId?: string;
  attachmentPointId?: string;
  groupId?: string;
}

export interface IKetConnection {
  connectionType: 'single' | 'hydrogen';
  label?: string;
  endpoint1: IKetConnectionEndPoint;
  endpoint2: IKetConnectionEndPoint;
}

export type monomerClass =
  | 'RNA'
  | 'PEPTIDE'
  | 'CHEM'
  | 'UNKNOWN'
  | 'DNA'
  | 'MODDNA';

export type ketMonomerClass =
  | 'AminoAcid'
  | 'Sugar'
  | 'Phosphate'
  | 'Base'
  | 'Terminator'
  | 'Linker'
  | 'Unknown'
  | 'CHEM';

export type IKetAttachmentPointType = 'left' | 'right' | 'side';

export interface IKetAttachmentPoint {
  attachmentAtom: number;
  leavingGroup: {
    atoms: number[];
  };
  type?: IKetAttachmentPointType;
  label?: string;
}

export interface IKetMonomerTemplate {
  type: 'monomerTemplate';
  class?: monomerClass;
  monomerSubClass?:
    | 'AminoAcid'
    | 'Sugar'
    | 'Phosphate'
    | 'Base'
    | 'Terminator'
    | 'Linker'
    | 'Unknown'
    | 'CHEM';
  naturalAnalogShort: string;
  id: string;
  fullName?: string;
  alias?: string;
  naturalAnalog?: string;
  attachmentPoints?: IKetAttachmentPoint[];
  root: {
    nodes;
  };
  classHELM?: string;
  name?: string;
}

export interface IKetNodeRef {
  $ref: string;
}

export interface IKetMonomerTemplateRef {
  $ref: string;
}

export interface IKetMacromoleculesContentRootProperty {
  root: {
    nodes: IKetNodeRef[];
    connections: IKetConnection[];
    templates: IKetMonomerTemplateRef[];
  };
}

export interface IKetMacromoleculesContentOtherProperties {
  [key: string]: KetNode | IKetMonomerTemplate;
}

export type IKetMacromoleculesContent = IKetMacromoleculesContentRootProperty &
  IKetMacromoleculesContentOtherProperties;
