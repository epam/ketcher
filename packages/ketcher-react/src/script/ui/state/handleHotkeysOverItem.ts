import { Dispatch } from 'redux'
import {
  fromAtomAddition,
  fromAtomsAttrs,
  fromBondAddition,
  fromFragmentDeletion,
  FunctionalGroup,
  SGroup,
  Atom
} from 'ketcher-core'
import Tools from '../../editor/tool'
import { onAction } from './shared'
import { Editor } from '../../editor'

type TNewAction = {
  tool: string
  opts?: any
}

type HandlersProps = {
  hoveredItemId: number
  newAction: TNewAction
  editor: Editor
  dispatch: Dispatch
}

type HandleHotkeyOverItemProps = {
  hoveredItem: Record<string, number>
  newAction: TNewAction
  editor: Editor
  dispatch: Dispatch
}

export function handleHotkeyOverItem(props: HandleHotkeyOverItemProps) {
  if (props.newAction.tool === 'eraser') {
    handleEraser(props)
  } else {
    handleTool(props)
  }
}

function handleEraser({ editor, hoveredItem }: HandleHotkeyOverItemProps) {
  const action = fromFragmentDeletion(
    editor.render.ctab,
    mapItemsToArrays(hoveredItem)
  )
  editor.update(action)
  editor.hover(null)
}

function handleTool({
  hoveredItem,
  newAction,
  editor,
  dispatch
}: HandleHotkeyOverItemProps) {
  for (const item in hoveredItem) {
    const toolHandler = getToolHandler(item, newAction.tool)
    const isChangeStructureTool = newAction.tool !== 'hand'
    const hoveredItemId = hoveredItem[item]

    if (toolHandler) {
      const props: HandlersProps = {
        hoveredItemId,
        editor,
        newAction,
        dispatch
      }
      isFunctionalGroupChange(props).then((result) => {
        if (!result && isChangeStructureTool) return
        toolHandler(props)
      })
    }
  }
}
async function isFunctionalGroupChange(props: HandlersProps): Promise<boolean> {
  return await isChangingFunctionalGroup(props)
}

function getToolHandler(itemType: string, toolName: string) {
  const items = {
    atoms: {
      atom: (props: HandlersProps) => handleAtomTool(props),
      bond: (props: HandlersProps) => handleBondTool(props),
      charge: (props: HandlersProps) => handleChargeTool(props),
      rgroupatom: (props: HandlersProps) => handleRGroupAtomTool(props),
      sgroup: ({ editor, hoveredItemId }: HandlersProps) => {
        Tools.sgroup.sgroupDialog(editor, hoveredItemId)
      },
      hand: ({ dispatch }: HandlersProps) =>
        dispatch(onAction({ tool: 'hand' }))
    },
    _default: {}
  }

  const item = items[itemType]

  if (item) return item[toolName]
  return items._default[toolName]
}

function handleAtomTool({ hoveredItemId, newAction, editor }: HandlersProps) {
  const atomProps = { ...newAction.opts }
  const updatedAtoms = fromAtomsAttrs(
    editor.render.ctab,
    hoveredItemId,
    atomProps,
    true
  )
  editor.update(updatedAtoms)
}

function handleBondTool({ hoveredItemId, newAction, editor }: HandlersProps) {
  const newBond = fromBondAddition(
    editor.render.ctab,
    newAction.opts,
    hoveredItemId,
    undefined
  )[0]
  editor.update(newBond)
}

function handleChargeTool({ hoveredItemId, newAction, editor }: HandlersProps) {
  const existingAtom = editor.render.ctab.atoms.get(hoveredItemId)?.a
  if (existingAtom) {
    const updatedAtom = fromAtomsAttrs(
      editor.render.ctab,
      hoveredItemId,
      {
        charge: existingAtom.charge + newAction.opts
      },
      null
    )
    editor.update(updatedAtom)
  }
}

function mapItemsToArrays(
  items: Record<string, number>
): Record<string, number[]> {
  const mappedItems = {}
  for (const item in items) {
    mappedItems[item] = [items[item]]
  }
  return mappedItems
}

async function handleRGroupAtomTool({ hoveredItemId, editor }: HandlersProps) {
  const struct = editor.render.ctab.molecule
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
  editor
}: HandlersProps) {
  const atomResult: number[] = []
  const result: number[] = []
  const atom = editor.render.ctab.atoms.get(hoveredItemId)?.a
  const molecule = editor.render.ctab.molecule
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
