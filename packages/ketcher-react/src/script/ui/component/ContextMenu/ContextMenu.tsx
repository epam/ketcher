import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Divider, Menu, MenuItem } from '@mui/material'
import {
  FunctionalGroup,
  setExpandSGroup,
  fromSgroupDeletion,
  Action
} from 'ketcher-core'
import { useAppContext } from '../../../../hooks'
import classes from './ContextMenu.module.less'
import { highlightFG } from '../../state/functionalGroups'

interface IContextMenuProps {
  contextMenu: {
    mouseX: number
    mouseY: number
  } | null
  handleClose: () => void
}

const FGContextMenu = ({ contextMenu, handleClose }: IContextMenuProps) => {
  const { getKetcherInstance } = useAppContext()
  const dispatch = useDispatch()

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
    highlightFG(dispatch, { group: null, id: null })
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

  useEffect(() => {
    if (contextMenu) {
      showMenu(contextMenu)
    }
  }, [contextMenu])

  function showMenu(coordinates) {
    const editor = getKetcherInstance().editor as any
    const struct = editor.struct()
    const selection = editor.selection()
    setShowSGroupMenu(false)
    setTargetItems([])
    const selectedItems = [] as Array<any>
    let fgId

    const ci = editor.findItem(
      {
        clientX: coordinates.mouseX,
        clientY: coordinates.mouseY
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
    <Menu
      open={showSGroupMenu && !!contextMenu}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu !== null
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
      MenuListProps={{ className: classes.contextMenu }}
    >
      <MenuItem onClick={handleExpand} className={classes.contextMenu_item}>
        {targetItems.length && targetItems[0].isExpanded
          ? 'Contract '
          : 'Expand '}
        Abbreviation
      </MenuItem>
      <Divider className={classes.contextMenu_divider} component="li" />
      <MenuItem onClick={handleRemove} className={classes.contextMenu_item}>
        Remove Abbreviation
      </MenuItem>
    </Menu>
  )
}

export { FGContextMenu }
