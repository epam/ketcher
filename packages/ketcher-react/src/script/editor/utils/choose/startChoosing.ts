import { closestToSel } from './chooseUtils/closestToSel'
import { chooseItems } from './chooseUtils/chooseItems'

export function startChoosing(event, editor, lassoHelper) {
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

  const sel = closestToSel(ci)
  chooseItems(editor, sel)
}
