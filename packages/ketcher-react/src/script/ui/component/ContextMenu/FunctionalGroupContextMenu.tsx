import { ContextMenu, MenuItem } from 'react-contextmenu'
import { connect } from 'react-redux'
import LassoHelper from '../../../../script/editor/tool/helper/lasso'
import Action from '../../../editor/shared/action'
import { FunctionalGroupsProvider } from 'ketcher-core'
import { fromSgroupAttrs } from '../../../editor/actions/sgroup'
import { fromAtomsAttrs } from '../../../editor/actions/atom'

function FGContextMenu(prop) {
  const isGgroupSelected = () => {
    const atoms = prop.editor._selection.atoms
    const sGroups = prop.editor.render.ctab.molecule.sgroups
    return sGroups.find(sg => sg.atoms === atoms)
  }
  const editor = prop.editor
  const lassoHelper = new LassoHelper(0, editor, 0)
  const disableMenu =
    prop.status.activeTool?.tool === 'select' && isGgroupSelected

  const handleClick = function (event) {
    const selectFragment = lassoHelper.fragment
    const rnd = editor.render
    const ctab = rnd.ctab

    const ci = prop.editor.findItem(
      event,
      selectFragment
        ? [
            'frags',
            'sgroups',
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
            'sgroupData',
            'rgroups',
            'rxnArrows',
            'rxnPluses',
            'enhancedFlags',
            'simpleObjects',
            'texts'
          ]
    )
    if (ci.map === 'sgroups') {
      const provider = FunctionalGroupsProvider.getInstance()
      const types = provider.getFunctionalGroupsList()

      const sgroup = ctab.sgroups.get(ci.id).item

      if (
        types.some(type => type.name === sgroup.data.name) &&
        sgroup.type === 'SUP'
      ) {
        const action = new Action()
        const functionalGroup = ctab.molecule.functionalGroups.get(ci.id)
        functionalGroup.isExpanded = !functionalGroup.isExpanded
        const relatedSGroup = ctab.sgroups.get(functionalGroup.relatedSGroupId)
        const atoms = relatedSGroup.item.atoms
        action.mergeWith(fromSgroupAttrs(rnd.ctab, ci.id, functionalGroup))
        atoms.forEach(aid => {
          action.mergeWith(
            fromAtomsAttrs(rnd.ctab, aid, ctab.atoms.get(aid).a, false)
          )
        })
        prop.editor.update(action)
      }
    }
  }

  return (
    disableMenu && (
      <ContextMenu id="fgid">
        <MenuItem onClick={event => handleClick(event)}>
          Expand/Contract Abbreviation
        </MenuItem>
        <MenuItem
          onClick={() => {
            console.log('here')
          }}>
          Remove Abbreviation
        </MenuItem>
      </ContextMenu>
    )
  )
}

const mapStateToProps = state => ({
  status: state.actionState || {},
  editor: state.editor
})

const FGContextMenuContainer = connect(mapStateToProps)(FGContextMenu)

export { FGContextMenuContainer }
