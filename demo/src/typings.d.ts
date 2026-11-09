type KetcherApiType = {
  renderFromCtab: (str: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  selectAtomsById: (arr: number[]) => void;
  exportCtab: () => Promise<string>;
  getSelectedAtomId: () => string | undefined;
  highlightSelection: (color: string) => {
    lastHighlightID: number;
    lastHighlight: any;
  };
  getAllHighlights: () => Array<any>;
  clearHighlights: () => void;
};

export declare global {
  const KetcherAPI: (arg) => KetcherApiType;
  const KetcherFunctions: KetcherApiType;
}
