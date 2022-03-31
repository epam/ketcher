import { ContextMenu, MenuItem } from 'react-contextmenu'
import { useState } from 'react'
import {
  FunctionalGroup,
  setExpandSGroup,
  fromSgroupDeletion,
  Action
} from 'ketcher-core'
import { useAppContext } from '../../../../hooks'
import clsx from 'clsx'
import classes from './ContextMenu.module.less'

const FGContextMenu = () => {
  const { getKetcherInstance } = useAppContext()

  const handleExpand = () => {
    const editor = getKetcherInstance().editor as any
    const action = new Action()
    const expandData = targetItems[0].isExpanded
    targetItems?.forEach((item) => {
      action.mergeWith(
        setExpandSGroup(editor.render.ctab, item.relatedSGroupId, {
          expanded: !expandData
        })
      )
    })
    editor.update(action)
    setShowSGroupMenu(false)
    setTargetItems([])
  }

  const handleRemove = function () {
    const editor = getKetcherInstance().editor as any
    const action = new Action()
    targetItems?.forEach((item) => {
      action.mergeWith(
        fromSgroupDeletion(editor.render.ctab, item.relatedSGroupId)
      )
    })
    editor.update(action)
    setShowSGroupMenu(false)
    setTargetItems([])
  }

  const [showSGroupMenu, setShowSGroupMenu] = useState(false)
  const [targetItems, setTargetItems] = useState([] as Array<any>)

  function showMenu(e) {
    const editor = getKetcherInstance().editor as any
    const struct = editor.struct()
    const selection = editor.selection()
    setShowSGroupMenu(false)
    setTargetItems([])
    const selectedItems = [] as Array<any>
    let fgId

    const ci = editor.findItem(
      {
        clientX: e.detail.position.x,
        clientY: e.detail.position.y
      },
      ['sgroups', 'functionalGroups', 'atoms', 'bonds']
    )
    if (ci) {
      switch (ci.map) {
        case 'atoms':
          fgId = FunctionalGroup.findFunctionalGroupByAtom(
            struct.functionalGroups,
            ci.id
          )
          fgId !== null &&
            struct.functionalGroups.forEach((fg) => {
              fg.relatedSGroupId === fgId &&
                !selectedItems.includes(fg) &&
                selectedItems.push(fg)
            })
          break
        case 'bonds':
          fgId = FunctionalGroup.findFunctionalGroupByBond(
            struct,
            struct.functionalGroups,
            ci.id
          )
          fgId !== null &&
            struct.functionalGroups.forEach((fg) => {
              fg.relatedSGroupId === fgId &&
                !selectedItems.includes(fg) &&
                selectedItems.push(fg)
            })
          break
        case 'sgroups':
          const sgroup = struct.sgroups.get(ci.id)
          if (FunctionalGroup.isFunctionalGroup(sgroup)) {
            struct.functionalGroups.forEach((fg) => {
              fg.relatedSGroupId === sgroup?.id &&
                !selectedItems.includes(fg) &&
                selectedItems.push(fg)
            })
          }
          break
        case 'functionalGroups':
          const fgroup = struct.sgroups.get(ci.id)
          if (FunctionalGroup.isFunctionalGroup(fgroup)) {
            struct.functionalGroups.forEach((fg) => {
              fg.relatedSGroupId === fgroup?.id &&
                !selectedItems.includes(fg) &&
                selectedItems.push(fg)
            })
          }
          break
      }
    }

    if (selection && selection.atoms) {
      selection.atoms.forEach((aid) => {
        const fgId = FunctionalGroup.findFunctionalGroupByAtom(
          struct.functionalGroups,
          aid
        )
        fgId !== null &&
          struct.functionalGroups.forEach((fg) => {
            fg.relatedSGroupId === fgId &&
              !selectedItems.includes(fg) &&
              selectedItems.push(fg)
          })
      })
    }
    if (selectedItems.length) {
      setTargetItems(selectedItems)
      setShowSGroupMenu(true)
    }
  }

  return (
    <ContextMenu
      id="contextmenu"
      onShow={(e) => showMenu(e)}
      className={clsx({
        [classes.isHidden]: !showSGroupMenu
      })}
    >
      <MenuItem onClick={handleExpand}>
        {targetItems.length && targetItems[0].isExpanded
          ? 'Contract '
          : 'Expand '}
        Abbreviation
      </MenuItem>
      <MenuItem divider />
      <MenuItem onClick={handleRemove}>Remove Abbreviation</MenuItem>
    </ContextMenu>
  )
}

export { FGContextMenu }
