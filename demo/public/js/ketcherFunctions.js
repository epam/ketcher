const KetcherAPI = (ketcherInstance) => {
  return {
    // Accepts CTAB as string
    renderFromCtab(str) {
      ketcherInstance.setMolecule(str);
    },

    clearSelection() {
      ketcherInstance.editor.selection(null);
    },

    selectAll() {
      ketcherInstance.editor.selection('all');
    },

    // Accepts IDs of atoms as an array of integers
    selectAtomsById(ids) {
      ketcherInstance.editor.selection({ atoms: ids });
    },

    // Returns Promise<string>
    exportCtab() {
      return ketcherInstance.getMolfile();
    },

    getSelectedAtomId() {
      const selection = ketcherInstance.editor.selection();
      if (!selection?.atoms) {
        return null;
      }

      let atoms = selection.atoms.join(', ');

      return atoms;
    },

    // Accepts color as a string
    highlightSelection(color) {
      const selection = ketcherInstance.editor.selection() || {};
      const { atoms, bonds } = selection;
      ketcherInstance.editor.highlights.create({ atoms, bonds, color });

      const allHighlights =
        ketcherInstance.editor.render.ctab.molecule.highlights;
      const lastHighlightID = [...allHighlights.keys()].pop();
      const lastHighlight = allHighlights.get(lastHighlightID);

      return {
        lastHighlightID,
        lastHighlight,
      };
    },

    clearHighlights() {
      ketcherInstance.editor.highlights.clear();
    },

    getAllHighlights() {
      const highlights = ketcherInstance.editor.highlights.getAll();
      return highlights;
    },
  };
};
