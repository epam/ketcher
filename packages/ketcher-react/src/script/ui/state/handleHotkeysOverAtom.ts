import {
  fromAtomsAttrs,
  fromBondAddition,
  fromOneAtomDeletion
} from 'ketcher-core'

export function handleHotkeyOverAtom(hoveredItemId, newAction, render, editor) {
  if (newAction.tool === 'atom') {
    handleAtomTool(hoveredItemId, newAction, render, editor)
    return
  }
  if (newAction.tool === 'bond') {
    handleBondTool(hoveredItemId, newAction, render, editor)
    return
  }
  if (newAction.tool === 'eraser') {
    handleEraserTool(hoveredItemId, newAction, render, editor)
    return
  }
  if (newAction.tool === 'select') {
    handleSelectionTool(hoveredItemId, newAction, render, editor)
    return
  }
  if (newAction.tool === 'charge') {
    handleChargeTool(hoveredItemId, newAction, render, editor)
  }
}

function handleAtomTool(hoveredItemId, newAction, render, editor) {
  const atomProps = { ...newAction.opts }
  const updatedAtoms = fromAtomsAttrs(
    render.ctab,
    hoveredItemId,
    atomProps,
    true
  )
  editor.update(updatedAtoms)
}

function handleBondTool(hoveredItemId, newAction, render, editor) {
  const newBond = fromBondAddition(
    render.ctab,
    newAction.opts,
    hoveredItemId,
    undefined
  )[0]
  editor.update(newBond)
}

function handleEraserTool(hoveredItemId, _, render, editor) {
  editor.update(fromOneAtomDeletion(render.ctab, hoveredItemId))
}

function handleSelectionTool(hoveredItemId, _, __, editor) {
  editor.selection({
    atoms: [hoveredItemId]
  })
}

function handleChargeTool(hoveredItemId, newAction, render, editor) {
  const existingAtom = render.ctab.atoms.get(hoveredItemId)?.a
  if (existingAtom) {
    const updatedAtom = fromAtomsAttrs(
      render.ctab,
      hoveredItemId,
      {
        charge: existingAtom.charge + newAction.opts.charge
      },
      null
    )
    editor.update(updatedAtom)
  }
}
