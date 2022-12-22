interface Selection {
  atoms?: Array<number>
  bonds?: Array<number>
  enhancedFlags?: Array<number>
  rxnPluses?: Array<number>
  rxnArrows?: Array<number>
}

export interface Editor {
  event: {
    chosenElementsChange: any
  }
  render: { ctab: any; update: () => void }
  _chosenElements: any
  struct(): { atoms: any }
  explicitSelected(): { atoms: any }
}

export function getChosenItems(editor: Editor) {
  return editor._chosenElements
}

export function chooseItems(editor: Editor, ci?: any) {
  editor._chosenElements = null

  if (ci) {
    const res: Selection = {}

    Object.keys(ci).forEach((key) => {
      if (ci[key].length > 0)
        // TODO: deep merge
        res[key] = ci[key].slice()
    })

    if (Object.keys(res).length !== 0) {
      editor._chosenElements = res
    }
  }

  editor.render.ctab.setChosenItems(editor._chosenElements)
  editor.event.chosenElementsChange.dispatch(editor._chosenElements)

  editor.render.update()
  return editor._chosenElements
}
