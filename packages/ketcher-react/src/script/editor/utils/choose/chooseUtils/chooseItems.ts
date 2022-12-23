const structObjects = [
  'atoms',
  'bonds',
  'frags',
  'sgroups',
  'sgroupData',
  'rgroups',
  'rxnArrows',
  'rxnPluses',
  'enhancedFlags',
  'simpleObjects',
  'texts'
]

interface Items {
  atoms?: Array<number>
  bonds?: Array<number>
}

export interface Editor {
  event: {
    chosenItemsChange: any
  }
  render: { ctab: any; update: () => void }
  _chosenItems?: any
}

export function getChosenItems(editor: Editor) {
  return editor._chosenItems
}

export function chooseItems(editor: Editor, ci?: any) {
  let ReStruct = editor.render.ctab

  editor._chosenItems = null

  if (ci === 'all') {
    // TODO: better way will be this.struct()
    ci = structObjects.reduce((res, key) => {
      res[key] = Array.from(ReStruct[key].keys())
      return res
    }, {})
  }

  if (ci === 'descriptors') {
    ReStruct = editor.render.ctab
    ci = { sgroupData: Array.from(ReStruct.sgroupData.keys()) }
  }

  if (ci) {
    const items: Items = {}

    Object.keys(ci).forEach((key) => {
      if (ci[key].length > 0) items[key] = ci[key].slice()
    })

    if (Object.keys(items).length !== 0) {
      editor._chosenItems = items
    }
  }

  editor.render.ctab.setChosenItems(editor._chosenItems)
  editor.event.chosenItemsChange.dispatch(editor._chosenItems)

  editor.render.update()
  return editor._chosenItems
}
