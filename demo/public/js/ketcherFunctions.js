const KetcherAPI = (ketcherInstance) => {
  return {
    // Accepts CTAB as string
    renderFromCtab: function (str) {
      ketcherInstance.setMolecule(str)
    },

    clearSelection: function () {
      ketcherInstance.editor.selection(null)
    },

    selectAll: function () {
      ketcherInstance.editor.selection('all')
    },

    // Accepts IDs of atoms as an array of integers
    selectAtomsById: function (ids) {
      ketcherInstance.editor.selection({ atoms: ids })
    },

    // Returns Promise<string>
    exportCtab: function () {
      return ketcherInstance.getMolfile()
    },

    getSelectedAtomId: function () {
      const selection = ketcherInstance.editor.selection()
      if (!selection?.atoms) {
        return null
      }

      let atoms = selection.atoms.join(', ')

      return atoms
    },

    // Accepts color as a string
    highlightSelection: function (color) {
      const selection = ketcherInstance.editor.selection() || {}
      const { atoms, bonds } = selection
      ketcherInstance.editor.highlights.create({ atoms, bonds, color })

      const allHighlights =
        ketcherInstance.editor.render.ctab.molecule.highlights
      const lastHighlightID = Array.from(allHighlights.keys()).pop()
      const lastHighlight = allHighlights.get(lastHighlightID)

      return {
        lastHighlightID,
        lastHighlight
      }
    },

    clearHighlights: function () {
      ketcherInstance.editor.highlights.clear()
    },

    getAllHighlights: function () {
      const highlights = ketcherInstance.editor.highlights.getAll()
      return highlights
    }
  }
}
