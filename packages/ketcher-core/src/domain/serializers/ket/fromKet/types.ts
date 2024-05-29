export interface KetAtom {
  attachmentPoints: number;
  label: string;
  location: [number, number, number];
}

export interface KetBond {
  type: number;
  atoms: [number, number];
}

export interface KetFragment {
  atoms?: KetAtom[];
  bonds?: KetBond[];
}

export interface KetItem {
  fragments?: KetFragment[];
  rlogic?: {
    number: number;
  };
}
