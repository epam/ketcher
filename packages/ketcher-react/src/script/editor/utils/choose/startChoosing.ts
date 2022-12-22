import { closestToSel } from './chooseUtils/closestToSel'
import { chooseItems } from './chooseUtils/chooseItems'

function isElementChosen(chosenElements, item) {
  return chosenElements?.[item.map]?.includes(item.id)
}

export function startChoosing(self, event, editor, lassoHelper) {
  console.log('startChoosing')
  self.dragCtx = {}

  const render = editor.render

  editor.hover(null) // TODO review hovering for touch devicess

  const selectFragment = lassoHelper.fragment || event.ctrlKey
  const ci = editor.findItem(
    event,
    selectFragment
      ? [
          'frags',
          'sgroups',
          'functionalGroups',
          'sgroupData',
          'rgroups',
          'rxnArrows',
          'rxnPluses',
          'enhancedFlags',
          'simpleObjects',
          'texts'
        ]
      : [
          'atoms',
          'bonds',
          'sgroups',
          'functionalGroups',
          'sgroupData',
          'rgroups',
          'rxnArrows',
          'rxnPluses',
          'enhancedFlags',
          'simpleObjects',
          'texts'
        ],
    null
  )

  self.dragCtx.item = ci
  self.dragCtx.xy0 = render.page2obj(event)

  const sel = closestToSel(ci)
  const selection = editor.selection()

  editor.selection(isElementChosen(selection, ci) ? selection : sel)
  chooseItems(editor, isElementChosen(selection, ci) ? selection : sel)

  return true
}
