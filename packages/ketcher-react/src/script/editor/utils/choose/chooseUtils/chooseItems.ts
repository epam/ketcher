interface Items {
  atoms?: Array<number>
  bonds?: Array<number>
}

export interface Editor {
  event: {
    chosenItemsChange: any
  }
  render: { ctab: any; update: () => void }
  _chosenItems: any
}

export function getChosenItems(editor: Editor) {
  return editor._chosenItems
}

export function chooseItems(editor: Editor, ci?: any) {
  editor._chosenItems = null

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
