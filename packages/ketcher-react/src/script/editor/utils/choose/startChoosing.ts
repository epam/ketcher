import { FunctionalGroup, SGroup } from 'ketcher-core'
import { atomLongtapEvent } from '../../tool/atom'
import { selMerge } from '../../tool/select'
import { closestToSel } from './chooseUtils/closestToSel'
import { chooseItems } from './chooseUtils/chooseItems'

// interface DragCtx {
//   item?: any
//   xy0?: any
// }

function isElementChosen(chosenElements, item) {
  return chosenElements?.[item.map]?.includes(item.id)
}

export function startChoosing(tool, event, editor, lassoHelper) {
  console.log('startChoosing')
  tool.dragCtx = {}

  const render = editor.render
  const ctab = render.ctab
  const molecule = ctab.molecule
  const functionalGroups = molecule.functionalGroups
  const chosenSgroups: any[] = []
  const newChosen = { atoms: [] as any[], bonds: [] as any[] }
  let actualSgroupId

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

  if (ci && ci.map === 'atoms' && functionalGroups.size) {
    const atomId = FunctionalGroup.atomsInFunctionalGroup(
      functionalGroups,
      ci.id
    )
    const atomFromStruct = atomId !== null && ctab.atoms.get(ci.id)?.a

    if (atomFromStruct) {
      for (const sgId of atomFromStruct.sgs.values()) {
        actualSgroupId = sgId
      }
    }
    if (
      atomFromStruct &&
      actualSgroupId !== undefined &&
      !chosenSgroups.includes(actualSgroupId)
    )
      chosenSgroups.push(actualSgroupId)
  }
  if (ci && ci.map === 'bonds' && functionalGroups.size) {
    const bondId = FunctionalGroup.bondsInFunctionalGroup(
      molecule,
      functionalGroups,
      ci.id
    )
    const sGroupId = FunctionalGroup.findFunctionalGroupByBond(
      molecule,
      functionalGroups,
      bondId
    )
    if (sGroupId !== null && !chosenSgroups.includes(sGroupId))
      chosenSgroups.push(sGroupId)
  }

  if (chosenSgroups.length) {
    console.log(' if (chosenSgroups.length)')
    for (const sgId of chosenSgroups) {
      const sgroup = ctab.sgroups.get(sgId)
      if (sgroup) {
        const sgroupAtoms = SGroup.getAtoms(molecule, sgroup.item)
        const sgroupBonds = SGroup.getBonds(molecule, sgroup.item)
        newChosen.atoms.push(...sgroupAtoms) &&
          newChosen.bonds.push(...sgroupBonds)
      }
    }
    console.log('newChosen', newChosen)
    // editor.selection(newChosen)
    chooseItems(newChosen)
  }

  tool.dragCtx.item = ci
  tool.dragCtx.xy0 = render.page2obj(event)

  if (!ci || ci.map === 'atoms') {
    atomLongtapEvent(tool, render)
  }

  if (!ci) {
    //  ci.type == 'Canvas'
    if (!event.shiftKey) editor.selection(null)
    delete tool.dragCtx.item
    if (!lassoHelper.fragment) lassoHelper.begin(event)
    return true
  }

  let sel = closestToSel(ci)
  const sgroups = ctab.sgroups.get(ci.id)
  const selection = editor.selection()
  if (ci.map === 'frags') {
    const frag = ctab.frags.get(ci.id)
    sel = {
      atoms: frag.fragGetAtoms(ctab, ci.id),
      bonds: frag.fragGetBonds(ctab, ci.id)
    }
  } else if (
    (ci.map === 'sgroups' || ci.map === 'functionalGroups') &&
    sgroups
  ) {
    const sgroup = sgroups.item
    sel = {
      atoms: SGroup.getAtoms(molecule, sgroup),
      bonds: SGroup.getBonds(molecule, sgroup)
    }
  } else if (ci.map === 'rgroups') {
    const rgroup = ctab.rgroups.get(ci.id)
    sel = {
      atoms: rgroup.getAtoms(render),
      bonds: rgroup.getBonds(render)
    }
  } else if (ci.map === 'sgroupData') {
    if (isElementChosen(selection, ci)) return true
  }

  if (event.shiftKey) {
    editor.selection(selMerge(sel, selection, true))
  } else {
    editor.selection(isElementChosen(selection, ci) ? selection : sel)
  }
  return true
}
