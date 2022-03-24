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
  Action,
  Editor as KetcherEditor,
  Pile,
  Render,
  Struct,
  Vec2,
  fromDescriptorsAlign,
  fromNewCanvas
} from 'ketcher-core'
import {
  DOMSubscription,
  PipelineSubscription,
  Subscription
} from 'subscription'

import closest from './shared/closest'
import { customOnChangeHandler } from './utils'
import { isEqual } from 'lodash/fp'
import toolMap from './tool'
import { Highlighter } from './highlighter'

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
  'simpleObjects',
  'texts'
]

const highlightTargets = [
  'atoms',
  'bonds',
  'rxnArrows',
  'rxnPluses',
  'functionalGroups',
  'frags',
  'merge',
  'rgroups',
  'sgroups',
  'sgroupData',
  'enhancedFlags',
  'simpleObjects',
  'texts'
]

function selectStereoFlagsIfNecessary(
  atoms: any,
  expAtoms: number[]
): number[] {
  const atomsOfFragments = {}
  atoms.forEach((atom, atomId) => {
    atomsOfFragments[atom.fragment]
      ? atomsOfFragments[atom.fragment].push(atomId)
      : (atomsOfFragments[atom.fragment] = [atomId])
  })

  const stereoFlags: number[] = []

  Object.keys(atomsOfFragments).forEach((fragId) => {
    let shouldSelSFlag = true
    atomsOfFragments[fragId].forEach((atomId) => {
      if (!expAtoms.includes(atomId)) shouldSelSFlag = false
    })
    shouldSelSFlag && stereoFlags.push(Number(fragId))
  })
  return stereoFlags
}

interface Selection {
  atoms?: Array<number>
  bonds?: Array<number>
  enhancedFlags?: Array<number>
  rxnPluses?: Array<number>
  rxnArrows?: Array<number>
}
class Editor implements KetcherEditor {
  #origin?: any
  render: Render
  _selection: Selection | null
  _tool: any
  historyStack: any
  historyPtr: any
  errorHandler: ((message: string) => void) | null
  highlights: Highlighter
  event: {
    message: Subscription
    elementEdit: PipelineSubscription
    bondEdit: PipelineSubscription
    rgroupEdit: PipelineSubscription
    sgroupEdit: PipelineSubscription
    sdataEdit: PipelineSubscription
    quickEdit: PipelineSubscription
    attachEdit: PipelineSubscription
    removeFG: PipelineSubscription
    change: Subscription
    selectionChange: PipelineSubscription
    aromatizeStruct: PipelineSubscription
    dearomatizeStruct: PipelineSubscription
    enhancedStereoEdit: PipelineSubscription
    confirm: PipelineSubscription
  }

  lastEvent: any

  constructor(clientArea, options) {
    console.log(options.scale)
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
    this.errorHandler = null
    this.highlights = new Highlighter(this)

    this.event = {
      message: new Subscription(),
      elementEdit: new PipelineSubscription(),
      bondEdit: new PipelineSubscription(),
      rgroupEdit: new PipelineSubscription(),
      sgroupEdit: new PipelineSubscription(),
      sdataEdit: new PipelineSubscription(),
      quickEdit: new PipelineSubscription(),
      attachEdit: new PipelineSubscription(),
      removeFG: new PipelineSubscription(),
      change: new Subscription(),
      selectionChange: new PipelineSubscription(),
      aromatizeStruct: new PipelineSubscription(),
      dearomatizeStruct: new PipelineSubscription(),
      // TODO: correct
      enhancedStereoEdit: new PipelineSubscription(),
      confirm: new PipelineSubscription()
    }

    domEventSetup(this, clientArea)
  }

  isDitrty(): boolean {
    const position = this.historyPtr
    const length = this.historyStack.length
    if (!length || !this.#origin) {
      return false
    }
    return !isEqual(this.historyStack[position - 1], this.#origin)
  }

  setOrigin(): void {
    const position = this.historyPtr
    this.#origin = position ? this.historyStack[position - 1] : null
  }

  tool(name?: any, opts?: any) {
    /* eslint-disable no-underscore-dangle */
    if (arguments.length === 0) {
      return this._tool
    }

    if (this._tool && this._tool.cancel) {
      this._tool.cancel()
    }

    const tool = new toolMap[name](this, opts)

    if (!tool || tool.isNotActiveTool) {
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

    let ReStruct = this.render.ctab

    this._selection = null // eslint-disable-line
    if (ci === 'all') {
      // TODO: better way will be this.struct()
      ci = structObjects.reduce((res, key) => {
        res[key] = Array.from(ReStruct[key].keys())
        return res
      }, {})
    }

    if (ci === 'descriptors') {
      ReStruct = this.render.ctab
      ci = { sgroupData: Array.from(ReStruct.sgroupData.keys()) }
    }

    if (ci) {
      const res: Selection = {}

      Object.keys(ci).forEach((key) => {
        if (ci[key].length > 0)
          // TODO: deep merge
          res[key] = ci[key].slice()
      })

      if (Object.keys(res).length !== 0) {
        this._selection = res // eslint-disable-line
      }
      const stereoFlags = selectStereoFlagsIfNecessary(
        this.struct().atoms,
        this.explicitSelected().atoms
      )
      if (stereoFlags.length !== 0) {
        this._selection && this._selection.enhancedFlags
          ? (this._selection.enhancedFlags = Array.from(
              new Set([...this._selection.enhancedFlags, ...stereoFlags])
            ))
          : (res.enhancedFlags = stereoFlags)
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
      setHover(tool.ci, false, this.render)
      delete tool.ci
    }

    if (ci && setHover(ci, true, this.render)) tool.ci = ci
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

    if (this._tool instanceof toolMap.paste) {
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
    if (this._tool instanceof toolMap.paste) {
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
    const subscriber = {
      handler: handler
    }

    switch (eventName) {
      case 'change':
        const subscribeFuncWrapper = (action) =>
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
    // Only for event type - subscription
    this.event[eventName].remove(subscriber.handler)
  }

  findItem(event: any, maps: any, skip: any = null) {
    const pos = new Vec2(this.render.page2obj(event))

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
      res.bonds.forEach((bid) => {
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
      new Pile(selection.simpleObjects),
      new Pile(selection.texts)
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
  ].forEach((eventName) => {
    editor.event[eventName] = new DOMSubscription()
    const subs = editor.event[eventName]
    clientArea.addEventListener(eventName, subs.dispatch.bind(subs))

    subs.add((event) => {
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

function recoordinate(editor: Editor, rp /* , vp */) {
  // rp is a point in scaled coordinates, which will be positioned
  // vp is the point where the reference point should now be (in view coordinates)
  //    or the center if not set
  console.assert(rp, 'Reference point not specified')
  editor.render.setScrollOffset(0, 0)
}

function getStructCenter(ReStruct, selection?) {
  const bb = ReStruct.getVBoxObj(selection || {})
  return Vec2.lc2(bb.p0, 0.5, bb.p1, 0.5)
}

export { Editor }
export default Editor

function setHover(ci: any, visible: any, render: any) {
  if (highlightTargets.indexOf(ci.map) === -1) {
    return false
  }

  let item: any = null

  if (ci.map === 'merge') {
    Object.keys(ci.items).forEach((mp) => {
      ci.items[mp].forEach((dstId) => {
        item = render.ctab[mp].get(dstId)!

        if (item) {
          item.setHover(visible, render)
        }
      })
    })

    return true
  }

  if (ci.map === 'functionalGroups') ci.map = 'sgroups' // TODO: Refactor object

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
      item1.setHover(visible, render)
    }

    const item2 = render.ctab.sgroupData.get(ci.id)
    if (item2) {
      item2.setHover(visible, render)
    }
  } else {
    item.setHover(visible, render)
  }
  return true
}
