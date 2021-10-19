import { ContextMenu, MenuItem } from 'react-contextmenu'
import closest from '../../../editor/shared/closest'
import { useState } from 'react'
import Action from '../../../editor/shared/action'
import { FunctionalGroupsProvider, Vec2 } from 'ketcher-core'
import {
  fromSgroupAttrs,
  fromSgroupDeletion
} from '../../../editor/actions/sgroup'
import { fromAtomsAttrs } from '../../../editor/actions/atom'
import { connect } from 'react-redux'
import classes from './ContextMenu.module.less'
//import {useAppContext} from "../../../../hooks";

function KetcherContextMenu(prop) {
  // const { getKetcherInstance } = useAppContext()
  // const promise = new Promise(resolve => {
  //   if (getKetcherInstance()) {
  //     resolve(getKetcherInstance().editor)
  //   }
  // })
  const editor = prop.editor

  const handleExpand = function () {
    const provider = FunctionalGroupsProvider.getInstance()
    const types = provider.getFunctionalGroupsList()
    const rnd = editor.render
    const ctab = rnd?.ctab

    const sgroup = ctab.sgroups.get(targetItemId).item

    if (
      types.some(type => type.name === sgroup.data.name) &&
      sgroup.type === 'SUP'
    ) {
      const action = new Action()
      const functionalGroup = ctab.molecule.functionalGroups.get(targetItemId)
      functionalGroup.isExpanded = !functionalGroup.isExpanded
      const relatedSGroup = ctab.sgroups.get(functionalGroup.relatedSGroupId)
      const atoms = relatedSGroup.item.atoms
      action.mergeWith(fromSgroupAttrs(rnd.ctab, targetItemId, functionalGroup))
      atoms.forEach(aid => {
        action.mergeWith(
          fromAtomsAttrs(rnd.ctab, aid, ctab.atoms.get(aid).a, false)
        )
      })
      editor.update(action)
    }
    setsGroupMenu(false)
    setTargetItemId(null)
  }

  const handleRemove = function () {
    editor.update(fromSgroupDeletion(editor.render.ctab, targetItemId))
    setsGroupMenu(false)
    setTargetItemId(null)
  }

  const [sGroupMenu, setsGroupMenu] = useState(false)
  const [targetItemId, setTargetItemId] = useState(null)

  function showMenu(e) {
    const pos = new Vec2(
      editor.render.page2obj({
        pageX: e.detail.position.x,
        pageY: e.detail.position.y
      })
    )
    const ci = closest.item(editor.render.ctab, pos, ['sgroups'])
    console.log(ci)
    if (ci) {
      switch (ci.map) {
        case 'atoms':
          const AtomFunctionalGroup = editor.render.ctab.sgroups.forEach(
            (sg, key) => {
              if (sg.item.atoms.includes(ci.id)) {
                return key
              }
            }
          )
          console.log(AtomFunctionalGroup)
          break
        case 'sgroups':
          setsGroupMenu(true)
          setTargetItemId(ci.id)
          break
        default:
          break
      }
    }
  }

  const menuItems = sGroupMenu => {
    if (sGroupMenu) {
      return (
        <div className={classes.contextMenu}>
          <MenuItem onClick={handleExpand} className={classes.menuItem}>
            {editor.render.ctab.molecule.functionalGroups.get(targetItemId)
              .isExpanded
              ? 'Contract'
              : 'Expand'}{' '}
            Abbreviation
          </MenuItem>
          <MenuItem onClick={handleRemove} className={classes.menuItem}>
            Remove Abbreviation
          </MenuItem>
        </div>
      )
    } else {
      return null
    }
  }

  return (
    <ContextMenu id="fgid" onShow={e => showMenu(e)}>
      {menuItems(sGroupMenu)}
    </ContextMenu>
  )
}

const mapStateToProps = state => ({
  editor: state.editor || {}
})

const ContextMenuContainer = connect(mapStateToProps)(KetcherContextMenu)

export { ContextMenuContainer }
