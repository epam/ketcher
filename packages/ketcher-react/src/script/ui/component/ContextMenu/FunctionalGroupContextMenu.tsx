import { ContextMenu, MenuItem } from 'react-contextmenu'
import { connect } from 'react-redux'
import Action from '../../../editor/shared/action'
import { FunctionalGroupsProvider } from 'ketcher-core'
import {
  fromSgroupAttrs,
  fromSgroupDeletion
} from '../../../editor/actions/sgroup'
import { fromAtomsAttrs } from '../../../editor/actions/atom'
import { isEqual } from 'lodash/fp'

function FGContextMenu(prop) {
  const editor = prop.editor
  const rnd = editor.render
  const ctab = rnd?.ctab

  const atoms = editor._selection?.atoms
  const sGroups = ctab?.molecule.sgroups

  let isSGgroupSelected = false
  let selectedSGroupId

  if (atoms && sGroups) {
    sGroups.forEach(sg => {
      if (isEqual(atoms, sg.atoms)) {
        isSGgroupSelected = true
        selectedSGroupId = sg.id
      }
    })
  }
  const disableMenu =
    prop.status.activeTool?.tool === 'select' && isSGgroupSelected

  const handleExpand = function () {
    const provider = FunctionalGroupsProvider.getInstance()
    const types = provider.getFunctionalGroupsList()

    const sgroup = ctab.sgroups.get(selectedSGroupId).item

    if (
      types.some(type => type.name === sgroup.data.name) &&
      sgroup.type === 'SUP'
    ) {
      const action = new Action()
      const functionalGroup = ctab.molecule.functionalGroups.get(
        selectedSGroupId
      )
      functionalGroup.isExpanded = !functionalGroup.isExpanded
      const relatedSGroup = ctab.sgroups.get(functionalGroup.relatedSGroupId)
      const atoms = relatedSGroup.item.atoms
      action.mergeWith(
        fromSgroupAttrs(rnd.ctab, selectedSGroupId, functionalGroup)
      )
      atoms.forEach(aid => {
        action.mergeWith(
          fromAtomsAttrs(rnd.ctab, aid, ctab.atoms.get(aid).a, false)
        )
      })
      editor.update(action)
    }
  }

  const handleRemove = function () {
    editor.update(fromSgroupDeletion(ctab, selectedSGroupId))
  }

  return disableMenu ? (
    <ContextMenu id="fgid">
      <MenuItem onClick={handleExpand}>
        {`${
          ctab.molecule.functionalGroups.get(selectedSGroupId).isExpanded
            ? 'Contract'
            : 'Expand'
        }` + ' Abbreviation'}
      </MenuItem>
      <MenuItem onClick={handleRemove}>Remove Abbreviation</MenuItem>
    </ContextMenu>
  ) : null
}

const mapStateToProps = state => ({
  status: state.actionState || {},
  editor: state.editor || {}
})

const FGContextMenuContainer = connect(mapStateToProps)(FGContextMenu)

export { FGContextMenuContainer }
