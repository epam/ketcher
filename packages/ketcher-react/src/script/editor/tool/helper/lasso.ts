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

import { Scale } from 'ketcher-core'
import locate from './locate'
import Editor from '../../Editor'

class LassoHelper {
  mode: any
  editor: Editor
  fragment: any
  points: any
  selection: any

  constructor(mode, editor, fragment) {
    this.mode = mode
    this.fragment = fragment
    this.editor = editor
  }

  getSelection = () => {
    const rnd = this.editor.render

    if (this.mode === 0) {
      return locate.inPolygon(rnd.ctab, this.points)
    }

    if (this.mode === 1) {
      return locate.inRectangle(rnd.ctab, this.points[0], this.points[1])
    }

    throw new Error('Selector mode unknown') // eslint-disable-line no-else-return
  }

  begin = (event) => {
    const rnd = this.editor.render
    this.points = [rnd.page2obj(event)]
    if (this.mode === 1) {
      this.points.push(this.points[0])
    }
  }

  running = () => {
    return !!this.points
  }

  addPoint = (event) => {
    if (!this.points) {
      return null
    }

    const rnd = this.editor.render

    if (this.mode === 0) {
      this.points.push(rnd.page2obj(event))
    } else if (this.mode === 1) {
      this.points = [this.points[0], rnd.page2obj(event)]
    }

    this.update()
    return this.getSelection()
  }

  update = () => {
    if (this.selection) {
      this.selection.remove()
      this.selection = null
    }

    if (this.points && this.points.length > 1) {
      const rnd = this.editor.render
      const dp = this.points.map((p) =>
        Scale.obj2scaled(p, rnd.options).add(rnd.options.offset)
      )
      this.selection =
        this.mode === 0
          ? rnd.selectionPolygon(dp)
          : rnd.selectionRectangle(dp[0], dp[1])
    }
  }

  end = () => {
    const ret = this.getSelection()
    this.points = null
    this.update()
    return ret
  }

  cancel = () => {
    this.points = null
    this.update()
  }
}

export default LassoHelper
