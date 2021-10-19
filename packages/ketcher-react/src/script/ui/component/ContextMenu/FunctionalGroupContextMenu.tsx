import { ContextMenu, MenuItem } from 'react-contextmenu'
import Action from '../../../editor/shared/action'
import { FunctionalGroupsProvider } from 'ketcher-core'
import {
  fromSgroupAttrs,
  fromSgroupDeletion
} from '../../../editor/actions/sgroup'
import { fromAtomsAttrs } from '../../../editor/actions/atom'
import { useAppContext } from '../../../../hooks'

function FGContextMenu() {
  const { getKetcherInstance } = useAppContext()
  const promise = new Promise(resolve => {
    if (getKetcherInstance()) {
      resolve(getKetcherInstance().editor)
    }
  })
  promise.then((res: any) => {
    const editor = res
    const rnd = editor.render
    const ctab = rnd?.ctab

    const sGroups = ctab?.molecule.sgroups

    //let isSGgroupSelected = false
    let selectedSGroupId

    if (sGroups) {
      sGroups.forEach(sg => {
        console.log(sg.highlight)
        if (sg.highlight) {
          //isSGgroupSelected = true
          selectedSGroupId = sg.id
        }
      })
    }
    const disableMenu = editor._tool.template
    console.log(disableMenu)

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
  })

  return null
}
export { FGContextMenu }
