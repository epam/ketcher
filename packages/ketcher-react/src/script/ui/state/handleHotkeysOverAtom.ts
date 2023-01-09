import {
  fromAtomAddition,
  fromAtomsAttrs,
  fromBondAddition,
  fromOneAtomDeletion,
  FunctionalGroup,
  SGroup,
  Atom
} from 'ketcher-core'
import Tools from '../../editor/tool'
import { onAction } from './shared'

type hotkeyOverAtomHandler = {
  hoveredItemId: number
  newAction: {
    tool: string
    opts?: any
  }
  render: any
  editor: any
}

export async function handleHotkeyOverAtom({
  hoveredItemId,
  newAction,
  render,
  editor,
  dispatch
}) {
  const toolsMapping = {
    atom: () => handleAtomTool({ hoveredItemId, newAction, render, editor }),
    bond: () => handleBondTool({ hoveredItemId, newAction, render, editor }),
    eraser: () =>
      handleEraserTool({ hoveredItemId, newAction, render, editor }),
    charge: () =>
      handleChargeTool({ hoveredItemId, newAction, render, editor }),
    rgroupatom: () =>
      handleRGroupAtomTool({ hoveredItemId, newAction, render, editor }),
    sgroup: () => {
      Tools.sgroup.sgroupDialog(editor, hoveredItemId, null)
    },
    hand: () =>
      dispatch(
        onAction({
          tool: 'hand'
        })
      )
  }
  const toolHandler = toolsMapping[newAction.tool]
  const isChangeStructureTool = newAction.tool !== 'hand'
  if (toolHandler) {
    const isFunctionalGroupChange = await isChangingFunctionalGroup({
      hoveredItemId,
      render,
      editor,
      newAction
    })
    if (!isFunctionalGroupChange && isChangeStructureTool) {
      return
    }
    toolHandler()
  }
}

function handleAtomTool({
  hoveredItemId,
  newAction,
  render,
  editor
}: hotkeyOverAtomHandler) {
  const atomProps = { ...newAction.opts }
  const updatedAtoms = fromAtomsAttrs(
    render.ctab,
    hoveredItemId,
    atomProps,
    true
  )
  editor.update(updatedAtoms)
}

function handleBondTool({
  hoveredItemId,
  newAction,
  render,
  editor
}: hotkeyOverAtomHandler) {
  const newBond = fromBondAddition(
    render.ctab,
    newAction.opts,
    hoveredItemId,
    undefined
  )[0]
  editor.update(newBond)
}

function handleEraserTool({
  hoveredItemId,
  render,
  editor
}: hotkeyOverAtomHandler) {
  editor.update(fromOneAtomDeletion(render.ctab, hoveredItemId))
}

function handleChargeTool({
  hoveredItemId,
  newAction,
  render,
  editor
}: hotkeyOverAtomHandler) {
  const existingAtom = render.ctab.atoms.get(hoveredItemId)?.a
  if (existingAtom) {
    const updatedAtom = fromAtomsAttrs(
      render.ctab,
      hoveredItemId,
      {
        charge: existingAtom.charge + newAction.opts
      },
      null
    )
    editor.update(updatedAtom)
  }
}

async function handleRGroupAtomTool({
  hoveredItemId,
  render,
  editor
}: hotkeyOverAtomHandler) {
  const struct = render.ctab.molecule
  const atom =
    hoveredItemId || hoveredItemId === 0
      ? struct.atoms.get(hoveredItemId)
      : null
  const rglabel = atom ? atom.rglabel : 0
  const label = atom ? atom.label : 'R#'

  try {
    let element = await editor.event.elementEdit.dispatch({
      label: 'R#',
      rglabel,
      fragId: atom ? atom.fragment : null
    })
    element = Object.assign({}, Atom.attrlist, element)

    if (!hoveredItemId && hoveredItemId !== 0 && element.rglabel) {
      editor.update(fromAtomAddition(editor.render.ctab, null, element))
    } else if (rglabel !== element.rglabel) {
      if (!element.rglabel && label !== 'R#') {
        element.label = label
      }

      editor.update(
        fromAtomsAttrs(editor.render.ctab, hoveredItemId, element, false)
      )
    }
  } catch (error) {} // w/o changes
}

async function isChangingFunctionalGroup({
  hoveredItemId,
  render,
  editor
}: hotkeyOverAtomHandler) {
  const atomResult: number[] = []
  const result: number[] = []
  const atom = render.ctab.atoms.get(hoveredItemId)?.a
  const molecule = render.ctab.molecule
  const functionalGroups = molecule.functionalGroups
  const sgroupsOnCanvas = Array.from(molecule.sgroups.values())
  if (atom && functionalGroups) {
    const atomId = FunctionalGroup.atomsInFunctionalGroup(
      functionalGroups,
      hoveredItemId
    )

    if (atomId !== null) {
      atomResult.push(atomId)
    }
  }

  const isFunctionalGroup = atomResult.length > 0

  if (isFunctionalGroup) {
    if (
      SGroup.isAtomInSaltOrSolvent(
        hoveredItemId as number,
        sgroupsOnCanvas as SGroup[]
      )
    ) {
      return false
    }
    for (const id of atomResult) {
      const fgId = FunctionalGroup.findFunctionalGroupByAtom(
        functionalGroups,
        id
      )

      if (fgId !== null && !result.includes(fgId)) {
        result.push(fgId)
      }
    }
    return await editor.event.removeFG.dispatch({ fgIds: result })
  }
  return true
}
