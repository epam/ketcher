/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/
import {
  DOMSubscription,
  PipelineSubscription,
  Subscription
} from 'subscription'

import { Struct, Pile, Vec2 } from 'ketcher-core'
import Render from '../render'
import { fromDescriptorsAlign, fromNewCanvas } from './actions/basic'
import Action from './shared/action'
import closest from './shared/closest'
import toolMap from './tool'
import { customOnChangeHandler, elementOffset } from './utils'

const SCALE = 40
const HISTORY_SIZE = 32 // put me to options

const structObjects = [
  'atoms',
  'bonds',
  'frags',
  'sgroups',
  'sgroupData',
  'rgroups',
  'rxnArrows',
  'rxnPluses',
  'enhancedFlags',
  'simpleObjects'
]

const highlightTargets = [
  'atoms',
  'bonds',
  'rxnArrows',
  'rxnPluses',
  'frags',
  'merge',
  'rgroups',
  'sgroups',
  'sgroupData',
  'enhancedFlags',
  'simpleObjects'
]

class Editor {
  render: Render
  _selection: any
  _tool: any
  historyStack: any
  historyPtr: any
  event: {
    message: Subscription
    elementEdit: PipelineSubscription
    bondEdit: PipelineSubscription
    rgroupEdit: PipelineSubscription
    sgroupEdit: PipelineSubscription
    sdataEdit: PipelineSubscription
    quickEdit: PipelineSubscription
    attachEdit: PipelineSubscription
    change: Subscription
    selectionChange: PipelineSubscription
    aromatizeStruct: PipelineSubscription
    dearomatizeStruct: PipelineSubscription
    enhancedStereoEdit: PipelineSubscription
  }
  lastEvent: any

  constructor(clientArea, options) {
    this.render = new Render(
      clientArea,
      Object.assign(
        {
          scale: SCALE
        },
        options
      )
    )

    this._selection = null // eslint-disable-line
    this._tool = null // eslint-disable-line
    this.historyStack = []
    this.historyPtr = 0

    this.event = {
      message: new Subscription(),
      elementEdit: new PipelineSubscription(),
      bondEdit: new PipelineSubscription(),
      rgroupEdit: new PipelineSubscription(),
      sgroupEdit: new PipelineSubscription(),
      sdataEdit: new PipelineSubscription(),
      quickEdit: new PipelineSubscription(),
      attachEdit: new PipelineSubscription(),
      change: new Subscription(),
      selectionChange: new PipelineSubscription(),
      aromatizeStruct: new PipelineSubscription(),
      dearomatizeStruct: new PipelineSubscription(),
      // TODO: correct
      enhancedStereoEdit: new PipelineSubscription()
    }

    domEventSetup(this, clientArea)
  }

  tool(name?: any, opts?: any) {
    /* eslint-disable no-underscore-dangle */
    if (arguments.length === 0) {
      return this._tool
    }

    if (this._tool && this._tool.cancel) {
      this._tool.cancel()
    }

    const tool = toolMap[name](this, opts)
    if (!tool) {
      return null
    }

    this._tool = tool
    return this._tool
    /* eslint-enable no-underscore-dangle */
  }

  clear() {
    this.struct(undefined)
  }

  struct(value?: Struct): Struct {
    if (arguments.length === 0) {
      return this.render.ctab.molecule
    }

    this.selection(null)
    const struct = value || new Struct()
    const action = fromNewCanvas(this.render.ctab, struct)
    this.update(action)

    const structCenter = getStructCenter(this.render.ctab)
    recoordinate(this, structCenter)
    return this.render.ctab.molecule
  }

  options(value?: any) {
    if (arguments.length === 0) {
      return this.render.options
    }

    const struct = this.render.ctab.molecule
    const zoom = this.render.options.zoom
    this.render.clientArea.innerHTML = ''

    this.render = new Render(
      this.render.clientArea,
      Object.assign({ scale: SCALE }, value)
    )
    this.render.setMolecule(struct) // TODO: reuse this.struct here?
    this.render.setZoom(zoom)
    this.render.update()
    return this.render.options
  }

  zoom(value?: any) {
    if (arguments.length === 0) {
      return this.render.options.zoom
    }

    this.render.setZoom(value)

    const selection = this.selection()
    const structCenter = getStructCenter(this.render.ctab, selection)
    recoordinate(this, structCenter)

    this.render.update()
    return this.render.options.zoom
  }

  selection(ci?: any) {
    if (arguments.length === 0) {
      return this._selection // eslint-disable-line
    }

    let restruct = this.render.ctab

    this._selection = null // eslint-disable-line
    if (ci === 'all') {
      // TODO: better way will be this.struct()
      ci = structObjects.reduce((res, key) => {
        res[key] = Array.from(restruct[key].keys())
        return res
      }, {})
    }

    if (ci === 'descriptors') {
      restruct = this.render.ctab
      ci = { sgroupData: Array.from(restruct['sgroupData'].keys()) }
    }

    if (ci) {
      const res = {}
      Object.keys(ci).forEach(key => {
        if (ci[key].length > 0)
          // TODO: deep merge
          res[key] = ci[key].slice()
      })
      if (Object.keys(res).length !== 0) {
        this._selection = res // eslint-disable-line
      }
    }

    this.render.ctab.setSelection(this._selection) // eslint-disable-line
    this.event.selectionChange.dispatch(this._selection) // eslint-disable-line

    this.render.update()
    return this._selection // eslint-disable-line
  }

  hover(ci: any, newTool?: any) {
    const tool = newTool || this._tool // eslint-disable-line

    if (
      'ci' in tool &&
      (!ci || tool.ci.map !== ci.map || tool.ci.id !== ci.id)
    ) {
      this.highlight(tool.ci, false)
      delete tool.ci
    }

    if (ci && this.highlight(ci, true)) tool.ci = ci
  }

  highlight(ci: any, visible: any) {
    if (highlightTargets.indexOf(ci.map) === -1) {
      return false
    }

    const render = this.render
    let item: any = null

    if (ci.map === 'merge') {
      Object.keys(ci.items).forEach(mp => {
        ci.items[mp].forEach(dstId => {
          item = render.ctab[mp].get(dstId)!

          if (item) {
            item.setHighlight(visible, render)
          }
        })
      })

      return true
    }

    item = (render.ctab[ci.map] as Map<any, any>).get(ci.id)
    if (!item) {
      return true // TODO: fix, attempt to highlight a deleted item
    }

    if (
      (ci.map === 'sgroups' && item.item.type === 'DAT') ||
      ci.map === 'sgroupData'
    ) {
      // set highlight for both the group and the data item
      const item1 = render.ctab.sgroups.get(ci.id)
      if (item1) {
        item1.setHighlight(visible, render)
      }

      const item2 = render.ctab.sgroupData.get(ci.id)
      if (item2) {
        item2.setHighlight(visible, render)
      }
    } else {
      item.setHighlight(visible, render)
    }
    return true
  }

  update(action: Action | true, ignoreHistory?) {
    if (action === true) {
      this.render.update(true) // force
    } else {
      if (!ignoreHistory && !action.isDummy()) {
        this.historyStack.splice(this.historyPtr, HISTORY_SIZE + 1, action)
        if (this.historyStack.length > HISTORY_SIZE) {
          this.historyStack.shift()
        }
        this.historyPtr = this.historyStack.length
        this.event.change.dispatch(action) // TODO: stoppable here
      }
      this.render.update()
    }
  }

  historySize() {
    return {
      undo: this.historyPtr,
      redo: this.historyStack.length - this.historyPtr
    }
  }

  undo() {
    if (this.historyPtr === 0) {
      throw new Error('Undo stack is empty')
    }
    if (this.tool() && this.tool().cancel) {
      this.tool().cancel()
    }

    this.selection(null)

    if (this._tool instanceof toolMap['paste']) {
      this.event.change.dispatch()
      return
    }

    this.historyPtr--
    const stack = this.historyStack[this.historyPtr]
    const action = stack.perform(this.render.ctab)

    this.historyStack[this.historyPtr] = action
    this.event.change.dispatch(action)
    this.render.update()
  }

  redo() {
    if (this.historyPtr === this.historyStack.length) {
      throw new Error('Redo stack is empty')
    }

    if (this.tool() && this.tool().cancel) {
      this.tool().cancel()
    }

    this.selection(null)
    if (this._tool instanceof toolMap['paste']) {
      this.event.change.dispatch()
      return
    }

    const action = this.historyStack[this.historyPtr].perform(this.render.ctab)
    this.historyStack[this.historyPtr] = action
    this.historyPtr++
    this.event.change.dispatch(action)
    this.render.update()
  }

  subscribe(eventName: any, handler: any) {
    let subscriber = {
      handler: handler
    }

    switch (eventName) {
      case 'change':
        const subscribeFuncWrapper = action =>
          customOnChangeHandler(action, handler)
        subscriber.handler = subscribeFuncWrapper
        this.event[eventName].add(subscribeFuncWrapper)
        break

      default:
        this.event[eventName].add(handler)
    }

    return subscriber
  }

  unsubscribe(eventName: any, subscriber: any) {
    //Only for event type - subscription
    this.event[eventName].remove(subscriber.handler)
  }

  findItem(event: any, maps: any, skip: any) {
    // todo: remove global
    const pos = (global as any)._ui_editor
      ? new Vec2(this.render.page2obj(event)) // eslint-disable-line
      : new Vec2(event.pageX, event.pageY).sub(
          elementOffset(this.render.clientArea)
        )

    return closest.item(this.render.ctab, pos, maps, skip, this.render.options)
  }

  findMerge(srcItems: any, maps: any) {
    return closest.merge(this.render.ctab, srcItems, maps, this.render.options)
  }

  explicitSelected() {
    const selection = this.selection() || {}
    const res = structObjects.reduce((acc, key) => {
      acc[key] = selection[key] ? selection[key].slice() : []
      return acc
    }, {} as any)

    const struct = this.render.ctab.molecule

    // "auto-select" the atoms for the bonds in selection
    if (res.bonds) {
      res.bonds.forEach(bid => {
        const bond = struct.bonds.get(bid)!
        res.atoms = res.atoms || []
        if (res.atoms.indexOf(bond.begin) < 0) {
          res.atoms.push(bond.begin)
        }

        if (res.atoms.indexOf(bond.end) < 0) {
          res.atoms.push(bond.end)
        }
      })
    }

    // "auto-select" the bonds with both atoms selected
    if (res.atoms && res.bonds) {
      struct.bonds.forEach((bond, bid) => {
        if (
          res.bonds.indexOf(bid) >= 0 &&
          res.atoms.indexOf(bond.begin) >= 0 &&
          res.atoms.indexOf(bond.end) >= 0
        ) {
          res.bonds = res.bonds || []
          res.bonds.push(bid)
        }
      })
    }

    return res
  }

  structSelected() {
    const struct = this.render.ctab.molecule
    const selection = this.explicitSelected()
    const dst = struct.clone(
      new Pile(selection.atoms),
      new Pile(selection.bonds),
      true,
      null,
      new Pile(selection.simpleObjects)
    )

    // Copy by its own as Struct.clone doesn't support
    // arrows/pluses id sets
    struct.rxnArrows.forEach((item, id) => {
      if (selection.rxnArrows.indexOf(id) !== -1)
        dst.rxnArrows.add(item.clone())
    })
    struct.rxnPluses.forEach((item, id) => {
      if (selection.rxnPluses.indexOf(id) !== -1)
        dst.rxnPluses.add(item.clone())
    })

    dst.isReaction = struct.isReaction && struct.isRxn()

    return dst
  }

  alignDescriptors() {
    this.selection(null)
    const action = fromDescriptorsAlign(this.render.ctab)
    this.update(action)
    this.render.update(true)
  }
}

function isMouseRight(event) {
  return (
    (event.which && event.which === 3) || (event.button && event.button === 2)
  )
}

function domEventSetup(editor: Editor, clientArea) {
  // TODO: addEventListener('resize', ...);
  ;[
    'click',
    'dblclick',
    'mousedown',
    'mousemove',
    'mouseup',
    'mouseleave'
  ].forEach(eventName => {
    editor.event[eventName] = new DOMSubscription()
    const subs = editor.event[eventName]
    clientArea.addEventListener(eventName, subs.dispatch.bind(subs))

    subs.add(event => {
      if (eventName !== 'mouseup' && eventName !== 'mouseleave') {
        // to complete drag actions
        if (
          isMouseRight(event) ||
          !event.target ||
          event.target.nodeName === 'DIV'
        ) {
          // click on scroll
          editor.hover(null)
          return true
        }
      }
      const EditorTool = editor.tool()
      editor.lastEvent = event
      if (EditorTool && eventName in EditorTool) {
        EditorTool[eventName](event)
      }
      return true
    }, -1)
  })
}

function recoordinate(editor: Editor, rp /* , vp*/) {
  // rp is a point in scaled coordinates, which will be positioned
  // vp is the point where the reference point should now be (in view coordinates)
  //    or the center if not set
  console.assert(rp, 'Reference point not specified')
  editor.render.setScrollOffset(0, 0)
}

function getStructCenter(restruct, selection?) {
  const bb = restruct.getVBoxObj(selection || {})
  return Vec2.lc2(bb.p0, 0.5, bb.p1, 0.5)
}

export { Editor }
export default Editor
