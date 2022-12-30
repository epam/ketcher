import utils from '../../shared/utils'
import {
  fromArrowResizing,
  fromMultipleMove,
  fromSimpleObjectResizing,
  getHoverToFuse,
  getItemsToFuse
} from 'ketcher-core'
import { selMerge } from '../../tool/select'

export function continueSelecting(event, self, lassoHelper) {
  const editor = self.editor
  const render = editor.render
  const restruct = editor.render.ctab
  const dragCtx = self.dragCtx
  if (dragCtx && dragCtx.stopTapping) dragCtx.stopTapping()
  if (dragCtx && dragCtx.item) {
    const atoms = restruct.molecule.atoms
    const selection = editor.selection()
    const shouldDisplayDegree =
      dragCtx.item.map === 'atoms' &&
      atoms?.get(dragCtx.item.id)?.neighbors.length === 1 &&
      selection?.atoms?.length === 1 &&
      !selection.bonds
    if (shouldDisplayDegree) {
      // moving selected objects
      const pos = render.page2obj(event)
      const angle = utils.calcAngle(dragCtx.xy0, pos)
      const degrees = utils.degrees(angle)
      self.editor.event.message.dispatch({ info: degrees + 'º' })
    }
    if (dragCtx.item.map === 'simpleObjects' && dragCtx.item.ref) {
      if (dragCtx?.action) dragCtx.action.perform(render.ctab)
      const current = render.page2obj(event)
      const diff = current.sub(self.dragCtx.xy0)
      dragCtx.action = fromSimpleObjectResizing(
        render.ctab,
        dragCtx.item.id,
        diff,
        current,
        dragCtx.item.ref,
        event?.shiftKey
      )
      editor.update(dragCtx.action, true)
      return true
    }
    if (dragCtx.item.map === 'rxnArrows' && dragCtx.item.ref) {
      if (dragCtx?.action) dragCtx.action.perform(render.ctab)
      const current = render.page2obj(event)
      const diff = current.sub(dragCtx.xy0)
      dragCtx.previous = current
      dragCtx.action = fromArrowResizing(
        render.ctab,
        dragCtx.item.id,
        diff,
        current,
        dragCtx.item.ref
      )
      editor.update(dragCtx.action, true)
      return true
    }
    if (dragCtx.action) {
      dragCtx.action.perform(restruct)
      // redraw the elements in unshifted position, lest the have different offset
      editor.update(dragCtx.action, true)
    }

    const expSel = editor.explicitSelected()
    dragCtx.action = fromMultipleMove(
      restruct,
      expSel,
      editor.render.page2obj(event).sub(dragCtx.xy0)
    )

    dragCtx.mergeItems = getItemsToFuse(editor, expSel)
    editor.hover(getHoverToFuse(dragCtx.mergeItems))

    editor.update(dragCtx.action, true)
    return true
  }

  if (lassoHelper?.running()) {
    const sel = lassoHelper.addPoint(event)
    editor.selection(
      !event.shiftKey ? sel : selMerge(sel, editor.selection(), false)
    )
    return true
  }

  const maps =
    lassoHelper.fragment || event.ctrlKey
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
        ]

  editor.hover(editor.findItem(event, maps, null), null, event)

  return true
}
