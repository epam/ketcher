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

import util from '../util'
import draw from '../draw'
import ReObject from './reobject'
import { scale } from 'ketcher-core'

function buildLabel(text, paper, position, options) {
  // eslint-disable-line max-statements
  let label = {}
  label.text = text.item.label
  text.color = '#000'

  label.path = paper.text(position.x, position.y, label.text).attr({
    font: options.font,
    'font-size': options.fontsz,
    'text-anchor': 'start',
    fill: text.color
  })

  label.rbb = util.relBox(label.path.getBBox())
  draw.recenterText(label.path, label.rbb)

  text.label = label
  return label
}

class ReText extends ReObject {
  constructor(text) {
    super()
    this.visel = undefined
    this.init('text')
    this.item = text
    this.color = '#000000'
    this.component = -1
  }
  static isSelectable() {
    return true
  }

  show(restruct, id, options) {
    const render = restruct.render
    const position = scale.obj2scaled(this.item.position, render.options)
    const label = buildLabel(this, render.paper, position, options)

    this.color = 'black'
    restruct.addReObjectPath('data', this.visel, label.path, position, true)
  }

  highlightPath(render) {
    const position = scale.obj2scaled(this.item.position, render.options)
    const scaleFactor = render.options.scale
    const labelCharacterBoxSide = render.options.labelCharacterBoxSide

    const sortedLines = this.item.label
      .split(/\r?\n/)
      .sort((a, b) => b.length - a.length)
    const linesNumber = sortedLines.length
    const longestString = sortedLines[0].length

    const x0 = position.x
    const y0 = position.y - labelCharacterBoxSide * linesNumber
    const width = longestString * labelCharacterBoxSide
    const height = linesNumber * labelCharacterBoxSide * 2.22
    const rounding = scaleFactor / 8

    return render.paper.rect(x0, y0, width, height, rounding)
  }

  drawHighlight(render) {
    const ret = this.highlightPath(render).attr(render.options.highlightStyle)
    render.ctab.addReObjectPath('highlighting', this.visel, ret)
    return ret
  }

  makeSelectionPlate(restruct, paper, styles) {
    return this.highlightPath(restruct.render).attr(styles.selectionStyle)
  }
}

export default ReText
