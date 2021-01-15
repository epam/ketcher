/****************************************************************************
 * Copyright 2020 EPAM Systems
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

import s from 'subscription'
import Vec2 from '../util/vec2'
import Pile from '../util/pile'

import Struct from '../chem/struct'
import Render from '../render'

import { fromNewCanvas, fromDescriptorsAlign } from './actions/basic'
import closest from './shared/closest'
import toolMap from './tool'

import { OperationType } from './operations/op'

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

function Editor(clientArea, options) {
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
    message: new s.Subscription(),
    elementEdit: new s.PipelineSubscription(),
    bondEdit: new s.PipelineSubscription(),
    rgroupEdit: new s.PipelineSubscription(),
    sgroupEdit: new s.PipelineSubscription(),
    sdataEdit: new s.PipelineSubscription(),
    quickEdit: new s.PipelineSubscription(),
    attachEdit: new s.PipelineSubscription(),
    change: new s.Subscription(),
    selectionChange: new s.PipelineSubscription(),
    aromatizeStruct: new s.PipelineSubscription(),
    dearomatizeStruct: new s.PipelineSubscription(),
    // TODO: correct
    enhancedStereoEdit: new s.PipelineSubscription()
  }

  domEventSetup(this, clientArea)
}

Editor.prototype.tool = function (name, opts) {
  /* eslint-disable no-underscore-dangle */
  if (arguments.length > 0) {
    if (this._tool && this._tool.cancel) this._tool.cancel()
    var tool = toolMap[name](this, opts)
    if (!tool) return null
    this._tool = tool
  }
  return this._tool
  /* eslint-enable no-underscore-dangle */
}

Editor.prototype.clear = function () {
  this.struct(null)
}

Editor.prototype.struct = function (value) {
  if (arguments.length > 0) {
    this.selection(null)
    this.update(fromNewCanvas(this.render.ctab, value || new Struct()))
    recoordinate(this, getStructCenter(this.render.ctab))
  }
  return this.render.ctab.molecule
}

Editor.prototype.options = function (value) {
  if (arguments.length > 0) {
    var struct = this.render.ctab.molecule
    var zoom = this.render.options.zoom
    this.render.clientArea.innerHTML = ''
    this.render = new Render(
      this.render.clientArea,
      Object.assign({ scale: SCALE }, value)
    )
    this.render.setMolecule(struct) // TODO: reuse this.struct here?
    this.render.setZoom(zoom)
    this.render.update()
  }
  return this.render.options
}

Editor.prototype.zoom = function (value) {
  if (arguments.length > 0) {
    this.render.setZoom(value)
    recoordinate(this, getStructCenter(this.render.ctab, this.selection()))
    this.render.update()
  }
  return this.render.options.zoom
}

Editor.prototype.selection = function (ci) {
  let restruct = this.render.ctab
  if (arguments.length > 0) {
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
      var res = {}
      Object.keys(ci).forEach(key => {
        if (ci[key].length > 0)
          // TODO: deep merge
          res[key] = ci[key].slice()
      })
      if (Object.keys(res).length !== 0) this._selection = res // eslint-disable-line
    }

    this.render.ctab.setSelection(this._selection) // eslint-disable-line
    this.event.selectionChange.dispatch(this._selection) // eslint-disable-line

    this.render.update()
  }
  return this._selection // eslint-disable-line
}

Editor.prototype.hover = function (ci, newTool) {
  const tool = newTool || this._tool // eslint-disable-line

  if ('ci' in tool && (!ci || tool.ci.map !== ci.map || tool.ci.id !== ci.id)) {
    this.highlight(tool.ci, false)
    delete tool.ci
  }

  if (ci && this.highlight(ci, true)) tool.ci = ci
}

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

Editor.prototype.highlight = function (ci, visible) {
  if (highlightTargets.indexOf(ci.map) === -1) return false

  var rnd = this.render
  var item = null

  if (ci.map === 'merge') {
    Object.keys(ci.items).forEach(mp => {
      ci.items[mp].forEach(dstId => {
        item = rnd.ctab[mp].get(dstId)

        if (item) item.setHighlight(visible, rnd)
      })
    })

    return true
  }
  item = rnd.ctab[ci.map].get(ci.id)
  if (!item) return true // TODO: fix, attempt to highlight a deleted item
  if (
    (ci.map === 'sgroups' && item.item.type === 'DAT') ||
    ci.map === 'sgroupData'
  ) {
    // set highlight for both the group and the data item
    var item1 = rnd.ctab.sgroups.get(ci.id)
    var item2 = rnd.ctab.sgroupData.get(ci.id)
    if (item1) item1.setHighlight(visible, rnd)
    if (item2) item2.setHighlight(visible, rnd)
  } else {
    item.setHighlight(visible, rnd)
  }
  return true
}

Editor.prototype.update = function (action, ignoreHistory) {
  if (action === true) {
    this.render.update(true) // force
  } else {
    if (!ignoreHistory && !action.isDummy()) {
      this.historyStack.splice(this.historyPtr, HISTORY_SIZE + 1, action)
      if (this.historyStack.length > HISTORY_SIZE) this.historyStack.shift()
      this.historyPtr = this.historyStack.length
      this.event.change.dispatch(action) // TODO: stoppable here
    }
    this.render.update()
  }
}

Editor.prototype.historySize = function () {
  return {
    undo: this.historyPtr,
    redo: this.historyStack.length - this.historyPtr
  }
}

Editor.prototype.undo = function () {
  if (this.historyPtr === 0) throw new Error('Undo stack is empty')
  if (this.tool() && this.tool().cancel) this.tool().cancel()
  this.selection(null)
  if (this._tool instanceof toolMap['paste']) {
    this.event.change.dispatch()
    return
  }
  this.historyPtr--
  const action = this.historyStack[this.historyPtr].perform(this.render.ctab)
  this.historyStack[this.historyPtr] = action
  this.event.change.dispatch(action)
  this.render.update()
}

Editor.prototype.redo = function () {
  if (this.historyPtr === this.historyStack.length)
    throw new Error('Redo stack is empty')
  if (this.tool() && this.tool().cancel) this.tool().cancel()
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

function customOnChangeHandler(action, handler) {
  const data = []

  action.operations.reverse().forEach(operation => {
    const op = operation._inverted
    switch (op.type) {
      case OperationType.ATOM_ADD:
      case OperationType.ATOM_DELETE:
        data.push({
          operation: op.type,
          id: op.data.aid,
          label: op.data.atom.label ? op.data.atom.label : '',
          position: {
            x: +op.data.pos.x.toFixed(2),
            y: +op.data.pos.y.toFixed(2)
          }
        })
        break

      case OperationType.ATOM_ATTR:
        data.push({
          operation: operation.type,
          id: operation.data.aid,
          attribute: operation.data.attribute,
          from: operation.data.value,
          to: operation.data2.value
        })
        break

      case OperationType.ATOM_MOVE:
        data.push({
          operation: op.type,
          id: op.data.aid,
          position: { x: +op.data.d.x.toFixed(2), y: +op.data.d.y.toFixed(2) }
        })
        break

      case OperationType.BOND_ADD:
      case OperationType.BOND_DELETE:
        data.push({
          operation: op.type,
          id: op.data.bid
        })
        break

      case OperationType.FRAGMENT_ADD:
      case OperationType.FRAGMENT_DELETE:
        data.push({
          operation: op.type,
          id: op.frid
        })
        break

      case OperationType.FRAGMENT_ADD_STEREO_ATOM:
      case OperationType.FRAGMENT_DELETE_STEREO_ATOM:
        data.push({
          operation: op.type,
          atomId: op.data.aid,
          fragId: op.data.frid
        })
        break

      case OperationType.S_GROUP_ATOM_ADD:
      case OperationType.S_GROUP_ATOM_REMOVE:
        data.push({
          operation: op.type,
          atomId: op.data.aid,
          sGroupId: op.data.sgid
        })
        break

      case OperationType.S_GROUP_CREATE:
      case OperationType.S_GROUP_DELETE:
        data.push({
          operation: op.type,
          type: op.data.type,
          sGroupId: op.data.sgid
        })
        break

      case OperationType.RXN_ARROW_ADD:
      case OperationType.RXN_ARROW_DELETE:
        data.push({
          operation: op.type,
          id: op.data.arid,
          position: {
            x: +op.data.pos.x.toFixed(2),
            y: +op.data.pos.y.toFixed(2)
          }
        })
        break

      case OperationType.RXN_ARROW_MOVE:
        data.push({
          operation: op.type,
          id: op.data.id,
          position: { x: +op.data.d.x.toFixed(2), y: +op.data.d.y.toFixed(2) }
        })
        break

      case OperationType.R_GROUP_FRAGMENT:
        data.push({
          operation: operation.type,
          id: op.frid
        })
        break

      case OperationType.SIMPLE_OBJECT_ADD:
      case OperationType.SIMPLE_OBJECT_DELETE:
        data.push({
          operation: op.type,
          id: op.data.id,
          mode: op.data.mode
        })
        break

      case OperationType.SIMPLE_OBJECT_RESIZE:
        data.push({
          operation: op.type,
          id: op.data.id
        })
        break

      case OperationType.SIMPLE_OBJECT_MOVE:
        data.push({
          operation: operation.type,
          id: operation.data.id,
          position: {
            x: +operation.data.d.x.toFixed(2),
            y: +operation.data.d.y.toFixed(2)
          }
        })
        break

      default:
        data.push({
          operation: op.type
        })
    }
  })

  return handler(data)
}

Editor.prototype.subscribe = function (eventName, handler) {
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

Editor.prototype.unsubscribe = function (eventName, subscriber) {
  //Only for event type - subscription
  this.event[eventName].remove(subscriber.handler)
}

function isMouseRight(event) {
  return (
    (event.which && event.which === 3) || (event.button && event.button === 2)
  )
}

function domEventSetup(editor, clientArea) {
  // TODO: addEventListener('resize', ...);
  ;[
    'click',
    'dblclick',
    'mousedown',
    'mousemove',
    'mouseup',
    'mouseleave'
  ].forEach(eventName => {
    editor.event[eventName] = new s.DOMSubscription()
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
      if (EditorTool && eventName in EditorTool) EditorTool[eventName](event)
      return true
    }, -1)
  })
}

Editor.prototype.findItem = function (event, maps, skip) {
  const pos = global._ui_editor
    ? new Vec2(this.render.page2obj(event)) // eslint-disable-line
    : new Vec2(event.pageX, event.pageY).sub(
        elementOffset(this.render.clientArea)
      )

  return closest.item(this.render.ctab, pos, maps, skip, this.render.options)
}

Editor.prototype.findMerge = function (srcItems, maps) {
  return closest.merge(this.render.ctab, srcItems, maps, this.render.options)
}

Editor.prototype.explicitSelected = function () {
  const selection = this.selection() || {}
  const res = structObjects.reduce((acc, key) => {
    acc[key] = selection[key] ? selection[key].slice() : []
    return acc
  }, {})

  const struct = this.render.ctab.molecule
  // "auto-select" the atoms for the bonds in selection
  if (res.bonds) {
    res.bonds.forEach(bid => {
      const bond = struct.bonds.get(bid)
      res.atoms = res.atoms || []
      if (res.atoms.indexOf(bond.begin) < 0) res.atoms.push(bond.begin)

      if (res.atoms.indexOf(bond.end) < 0) res.atoms.push(bond.end)
    })
  }
  // "auto-select" the bonds with both atoms selected
  if (res.atoms && res.bonds) {
    struct.bonds.forEach((bond, bid) => {
      if (!res.bonds.indexOf(bid) < 0) {
        if (
          res.atoms.indexOf(bond.begin) >= 0 &&
          res.atoms.indexOf(bond.end) >= 0
        ) {
          res.bonds = res.bonds || []
          res.bonds.push(bid)
        }
      }
    })
  }

  return res
}

Editor.prototype.structSelected = function () {
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
    if (selection.rxnArrows.indexOf(id) !== -1) dst.rxnArrows.add(item.clone())
  })
  struct.rxnPluses.forEach((item, id) => {
    if (selection.rxnPluses.indexOf(id) !== -1) dst.rxnPluses.add(item.clone())
  })

  // TODO: should be reaction only if arrwos? check this logic
  dst.isReaction =
    struct.isReaction && (dst.rxnArrows.size || dst.rxnPluses.size)

  return dst
}

Editor.prototype.alignDescriptors = function () {
  this.selection(null)
  const action = fromDescriptorsAlign(this.render.ctab)
  this.update(action)
  this.render.update(true)
}

function recoordinate(editor, rp /* , vp*/) {
  // rp is a point in scaled coordinates, which will be positioned
  // vp is the point where the reference point should now be (in view coordinates)
  //    or the center if not set
  console.assert(rp, 'Reference point not specified')
  editor.render.setScrollOffset(0, 0)
}

function getStructCenter(restruct, selection) {
  var bb = restruct.getVBoxObj(selection || {})
  return Vec2.lc2(bb.p0, 0.5, bb.p1, 0.5)
}

// TODO: find DOM shorthand
function elementOffset(element) {
  let top = 0
  let left = 0
  do {
    top += element.offsetTop || 0
    left += element.offsetLeft || 0
    element = element.offsetParent
  } while (element)
  return new Vec2(left, top)
}

export default Editor
