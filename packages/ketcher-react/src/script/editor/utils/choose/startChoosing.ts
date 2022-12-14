import { FunctionalGroup, SGroup } from 'ketcher-core'
import { atomLongtapEvent } from '../../tool/atom'
import { selMerge } from '../../tool/select'
import { closestToSel } from './chooseUtils/closestToSel'

interface DragCtx {
  item?: any
  xy0?: any
}

function isSelected(selection, item) {
  return (
    selection && selection[item.map] && selection[item.map].includes(item.id)
  )
}

export function startChoosing(event, self, editor, lassoHelper) {
  console.log('startChoosing')
  const dragCtx: DragCtx = {}

  const render = editor.render
  const ctab = render.ctab
  const molecule = ctab.molecule
  const functionalGroups = molecule.functionalGroups
  const selectedSgroups: any[] = []
  const newSelected = { atoms: [] as any[], bonds: [] as any[] }
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
      !selectedSgroups.includes(actualSgroupId)
    )
      selectedSgroups.push(actualSgroupId)
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
    if (sGroupId !== null && !selectedSgroups.includes(sGroupId))
      selectedSgroups.push(sGroupId)
  }

  if (selectedSgroups.length) {
    for (const sgId of selectedSgroups) {
      const sgroup = ctab.sgroups.get(sgId)
      if (sgroup) {
        const sgroupAtoms = SGroup.getAtoms(molecule, sgroup.item)
        const sgroupBonds = SGroup.getBonds(molecule, sgroup.item)
        newSelected.atoms.push(...sgroupAtoms) &&
          newSelected.bonds.push(...sgroupBonds)
      }
    }
    editor.selection(newSelected)
  }

  dragCtx.item = ci
  dragCtx.xy0 = render.page2obj(event)

  if (!ci || ci.map === 'atoms') {
    atomLongtapEvent(self, render)
  }

  if (!ci) {
    //  ci.type == 'Canvas'
    if (!event.shiftKey) editor.selection(null)
    delete dragCtx.item
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
    if (isSelected(selection, ci)) return true
  }

  if (event.shiftKey) {
    editor.selection(selMerge(sel, selection, true))
  } else {
    editor.selection(isSelected(selection, ci) ? selection : sel)
  }
  return true
}
