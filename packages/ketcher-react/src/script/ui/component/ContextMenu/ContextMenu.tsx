import { ContextMenu, MenuItem } from 'react-contextmenu'
import { useState } from 'react'
import {
  FunctionalGroup,
  setExpandSGroup,
  fromSgroupDeletion
} from 'ketcher-core'
import classes from './ContextMenu.module.less'
import { useAppContext } from '../../../../hooks'

const FGContextMenu = () => {
  const { getKetcherInstance } = useAppContext()

  const handleExpand = () => {
    const editor = getKetcherInstance().editor as any
    editor.update(
      setExpandSGroup(editor.render.ctab, targetFG?.relatedSGroupId, {
        expanded: !targetFG?.isExpanded
      })
    )
    setShowSGroupMenu(false)
    setTargetFG(null)
  }

  const handleRemove = function () {
    const editor = getKetcherInstance().editor as any
    editor.update(
      fromSgroupDeletion(editor.render.ctab, targetFG?.relatedSGroupId)
    )
    setShowSGroupMenu(false)
    setTargetFG(null)
  }

  const [showSGroupMenu, setShowSGroupMenu] = useState(false)
  const [targetFG, setTargetFG] = useState(null as FunctionalGroup | null)

  function showMenu(e) {
    const editor = getKetcherInstance().editor as any
    const struct = editor.struct()
    setShowSGroupMenu(false)
    setTargetFG(null)
    const ci = editor.findItem(
      {
        pageX: e.detail.position.x,
        pageY: e.detail.position.y
      },
      ['sgroups', 'atoms']
    )
    if (ci) {
      switch (ci.map) {
        case 'atoms':
          let AtomSGroup = -1
          struct.sgroups.forEach((sg, key) => {
            if (sg.atoms.includes(ci.id)) {
              AtomSGroup = key
            }
          })
          if (AtomSGroup !== -1) {
            const sgroup = struct.sgroups.get(AtomSGroup)
            if (FunctionalGroup.isFunctionalGroup(sgroup)) {
              struct.functionalGroups.forEach(fg => {
                if (fg.relatedSGroupId === sgroup?.id) {
                  setShowSGroupMenu(true)
                  setTargetFG(fg)
                }
              })
            }
          }
          break
        case 'sgroups':
          const sgroup = struct.sgroups.get(ci.id)
          if (FunctionalGroup.isFunctionalGroup(sgroup)) {
            struct.functionalGroups.forEach(fg => {
              if (fg.relatedSGroupId === sgroup?.id) {
                setShowSGroupMenu(true)
                setTargetFG(fg)
              }
            })
          }
          break
      }
    }
  }

  return (
    <ContextMenu id="contextmenu" onShow={e => showMenu(e)}>
      {showSGroupMenu && (
        <div className={classes.contextMenu}>
          <MenuItem
            onClick={handleExpand}
            attributes={{
              className: classes.menuItem,
              dividerClassName: classes.menuItemDivider,
              selectedClassName: classes.menuItemSelected
            }}>
            {targetFG?.isExpanded ? 'Contract ' : 'Expand '}
            Abbreviation
          </MenuItem>
          <MenuItem
            divider
            attributes={{
              className: classes.menuItem,
              dividerClassName: classes.menuItemDivider,
              selectedClassName: classes.menuItemSelected
            }}
          />
          <MenuItem
            onClick={handleRemove}
            attributes={{
              className: classes.menuItem,
              dividerClassName: classes.menuItemDivider,
              selectedClassName: classes.menuItemSelected
            }}>
            Remove Abbreviation
          </MenuItem>
        </div>
      )}
    </ContextMenu>
  )
}

export { FGContextMenu }
