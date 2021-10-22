import { ContextMenu, MenuItem } from 'react-contextmenu'
import closest from '../../../editor/shared/closest'
import { useState } from 'react'
import { FunctionalGroup, setExpandSGroup } from 'ketcher-core'
import { Vec2 } from 'ketcher-core'
import { fromSgroupDeletion } from 'ketcher-core'
import classes from './ContextMenu.module.less'
import { useAppContext } from '../../../../hooks'

  const attributes = {
    className: classes['react-contextmenu-item'],
    dividerClassName: classes['react-contextmenu-item--divider'],
    selectedClassName: classes['react-contextmenu-item--selected']
  }

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
    const pos = new Vec2(
      editor.render.page2obj({
        pageX: e.detail.position.x,
        pageY: e.detail.position.y
      })
    )
    const ci = closest.item(editor.render.ctab, pos, ['sgroups', 'atoms'])
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
      {showSGroupMenu &&
        <div className={classes['react-contextmenu']}>
          <MenuItem onClick={handleExpand} attributes={attributes}>
            {targetFG?.isExpanded ? 'Contract ' : 'Expand '}
            Abbreviation
          </MenuItem>
          <MenuItem divider attributes={attributes}/>
          <MenuItem onClick={handleRemove} attributes={attributes}>
            Remove Abbreviation
          </MenuItem>
        </div>
      }
    </ContextMenu>
  )
}

export { FGContextMenu }
