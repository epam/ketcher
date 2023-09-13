export interface IKetMonomerNode {
  type: 'monomer';
  id: string;
  seqid?: number;
  position: {
    x: number;
    y: number;
  };
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
  endPoint1: IKetConnectionEndPoint;
  endPoint2: IKetConnectionEndPoint;
}

export type monomerClass = 'RNA' | 'PEPTIDE' | 'CHEM' | 'UNKNOWN';

export interface IKetMonomerTemplate {
  type: 'monomerTemplate';
  monomerClass?: monomerClass;
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
  attachmentPoints?;
  root: {
    nodes;
  };
}

export interface IKetMacromoleculesContent {
  root: {
    nodes: KetNode[];
    connections: IKetConnection[];
    templates: IKetMonomerTemplate[];
  };
}
