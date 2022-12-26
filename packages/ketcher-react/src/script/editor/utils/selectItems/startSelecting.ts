import { FunctionalGroup, SGroup } from 'ketcher-core'
import { selMerge } from '../../tool/select'

function isSelected(selection, item) {
  return (
    selection && selection[item.map] && selection[item.map].includes(item.id)
  )
}

function closestToSel(closestItem) {
  const res = {}
  res[closestItem.map] = [closestItem.id]
  return res
}

export function startSelecting(event, editor, lassoHelper, self) {
  const render = editor.render
  const ctab = render.ctab
  const molecule = ctab.molecule
  const functionalGroups = molecule.functionalGroups
  const selectedSgroups: any[] = []
  const newSelected = { atoms: [] as any[], bonds: [] as any[] }
  let actualSgroupId

  const selectFragment = lassoHelper.fragment || event.ctrlKey
  const closestItem = editor.findItem(
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

  if (closestItem && closestItem.map === 'atoms' && functionalGroups.size) {
    const atomId = FunctionalGroup.atomsInFunctionalGroup(
      functionalGroups,
      closestItem.id
    )
    const atomFromStruct = atomId !== null && ctab.atoms.get(closestItem.id)?.a

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
  if (closestItem && closestItem.map === 'bonds' && functionalGroups.size) {
    const bondId = FunctionalGroup.bondsInFunctionalGroup(
      molecule,
      functionalGroups,
      closestItem.id
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

  self.dragCtx = {
    item: closestItem,
    xy0: render.page2obj(event)
  }

  if (!closestItem) {
    //  when closestItem.type == 'Canvas'
    if (!event.shiftKey) self.editor.selection(null)
    delete self.dragCtx.item
    if (!self.lassoHelper.fragment) self.lassoHelper.begin(event)
    return true
  }

  let sel = closestToSel(closestItem)
  const sgroups = ctab.sgroups.get(closestItem.id)
  const selection = self.editor.selection()
  if (closestItem.map === 'frags') {
    const frag = ctab.frags.get(closestItem.id)
    sel = {
      atoms: frag.fragGetAtoms(ctab, closestItem.id),
      bonds: frag.fragGetBonds(ctab, closestItem.id)
    }
  } else if (
    (closestItem.map === 'sgroups' || closestItem.map === 'functionalGroups') &&
    sgroups
  ) {
    const sgroup = sgroups.item
    sel = {
      atoms: SGroup.getAtoms(molecule, sgroup),
      bonds: SGroup.getBonds(molecule, sgroup)
    }
  } else if (closestItem.map === 'rgroups') {
    const rgroup = ctab.rgroups.get(closestItem.id)
    sel = {
      atoms: rgroup.getAtoms(render),
      bonds: rgroup.getBonds(render)
    }
  } else if (closestItem.map === 'sgroupData') {
    if (isSelected(selection, closestItem)) return true
  }

  if (event.shiftKey) {
    self.editor.selection(selMerge(sel, selection, true))
  } else {
    self.editor.selection(isSelected(selection, closestItem) ? selection : sel)
  }
  return true
}
