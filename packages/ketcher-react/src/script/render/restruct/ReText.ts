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

import ReObject from './ReObject'
import { scale, Vec2, Text } from 'ketcher-core'
import { LayerMap } from './GeneralEnumTypes'
import {
  DraftInlineStyleType,
  RawDraftContentBlock,
  RawDraftInlineStyleRange
} from 'draft-js'
import _ from 'lodash'
import ReStruct from './ReStruct'
import { TextStyle } from '../../ui/views/modal/components/Text/components/TextControlPanel'

class ReText extends ReObject {
  private item: Text
  paths: Array<Array<any>> = []

  constructor(text: Text) {
    super('text')
    this.item = text
  }
  static isSelectable() {
    return true
  }

  getReferencePoints(): Array<Vec2> {
    const { p0, p1 } = this.getRelBox()

    const p = this.item.position
    const w = Math.abs(Vec2.diff(p0, p1).x) / 40
    const h = Math.abs(Vec2.diff(p0, p1).y) / 40

    const refPoints: Array<Vec2> = []

    refPoints.push(
      this.item.position,
      new Vec2(p.x, p.y + h),
      new Vec2(p.x + w, p.y + h),
      new Vec2(p.x + w, p.y)
    )

    return refPoints
  }

  highlightPath(render: any): any {
    const { p0, p1 } = this.getRelBox()
    const topLeft = p0.sub(render.options.offset)
    const { x: width, y: height } = p1.sub(p0)

    return render.paper.rect(topLeft.x, topLeft.y, width, height, 5)
  }

  getRelBox(): { p0: Vec2; p1: Vec2 } {
    const lastRow: Array<any> = this.paths[this.paths.length - 1]
    const widestRow: Array<any> = this.paths.reduce(
      (widestRow, nextRow) =>
        this.getRowWidth(nextRow) > this.getRowWidth(widestRow)
          ? nextRow
          : widestRow,
      this.paths[0]
    )

    const firstElOfFirstRow: any = this.paths[0][0]
    const lastElOfWidestRow: any = widestRow[widestRow.length - 1]

    const rightEdgeOfWidestRow: number =
      lastElOfWidestRow.getBBox().x + lastElOfWidestRow.getBBox().width
    const bottomEdgeOfLastRow: number = lastRow.reduce((acc, nextEl) => {
      const bottomEdgeOfEl = nextEl.getBBox().y + nextEl.getBBox().height

      if (bottomEdgeOfEl > acc) {
        acc = bottomEdgeOfEl
      }

      return acc
    }, 0)

    return {
      p0: new Vec2(
        firstElOfFirstRow.getBBox().x,
        firstElOfFirstRow.getBBox().y
      ),
      p1: new Vec2(rightEdgeOfWidestRow, bottomEdgeOfLastRow)
    }
  }

  getRowWidth(row: Array<any>): number {
    return row.reduce((rowWidth, nextRow) => {
      rowWidth += nextRow.getBBox().width
      return rowWidth
    }, 0)
  }

  drawHighlight(render: any): any {
    if (!this.paths.length) return null
    const ret = this.highlightPath(render).attr(render.options.highlightStyle)
    render.ctab.addReObjectPath(LayerMap.highlighting, this.visel, ret)
    return ret
  }

  makeSelectionPlate(restruct: ReStruct, paper: any, options: any): any {
    if (!this.paths.length || !paper) return null
    return this.highlightPath(restruct.render).attr(options.selectionStyle)
  }

  show(restruct: ReStruct, _id: number, options: any): void {
    const render = restruct.render
    const paper = render.paper
    const paperScale = scale.obj2scaled(this.item.position, options)

    let shiftY: number = 0
    this.paths = []
    this.item.rawContent.blocks.forEach((block: RawDraftContentBlock) => {
      const ranges: Array<
        [number, number, Record<string, any>]
      > = this.getRanges(block, options)

      let shiftX: number = 0
      const row: Array<any> = []
      ranges.forEach(([start, end, styles]) => {
        block.text = block.text.replace(/[^\S\r\n]/g, '\u00a0')

        const path = paper
          .text(
            paperScale.x,
            paperScale.y,
            block.text.substring(start, end + 1) || '\u00a0'
          )
          .attr({
            font: options.font,
            'font-size': options.fontsz,
            'text-anchor': 'start',
            fill: '#000000',
            ...styles
          })

        path.translateAbs(shiftX, shiftY + (styles.shiftY || 0))

        row.push(path)
        shiftX += path.getBBox().width
      })

      this.paths.push(row)
      shiftY += row[0].getBBox().height
    })

    render.ctab.addReObjectPath(
      LayerMap.data,
      this.visel,
      _.flatten(this.paths),
      null,
      true
    )
  }

  getRanges(
    block: RawDraftContentBlock,
    options: any
  ): Array<[number, number, Record<string, any>]> {
    const ranges: Array<[number, number, Record<string, any>]> = []

    let start: number = 0
    let styles: Record<string, any> = this.getStyles(block, start, options)
    for (let i = 1; i < block.text.length; i++) {
      const nextStyles = this.getStyles(block, i, options)

      if (!_.isEqual(styles, nextStyles)) {
        ranges.push([start, i - 1, styles])
        styles = nextStyles
        start = i
      }
    }
    ranges.push([start, block.text.length - 1, styles])

    return ranges
  }

  getStyles(
    block: RawDraftContentBlock,
    index: number,
    options: any
  ): Record<string, string> {
    return block.inlineStyleRanges
      .filter(
        (inlineRange: CustomRawDraftInlineStyleRange) =>
          inlineRange.offset <= index &&
          index < inlineRange.offset + inlineRange.length
      )
      .reduce((styles: any, textRange: CustomRawDraftInlineStyleRange) => {
        switch (textRange.style) {
          case TextStyle.Bold:
            styles['font-weight'] = 'bold'
            break

          case TextStyle.Italic:
            styles['font-style'] = 'italic'
            break

          case TextStyle.Subscript:
            styles['font-size'] = options.fontszsub + 'px'
            styles.shiftY = options.fontsz / 3
            break

          case TextStyle.Superscript:
            styles['font-size'] = options.fontszsub + 'px'
            styles.shiftY = -options.fontsz / 3
            break

          default:
        }

        return styles
      }, {})
  }
}

interface CustomRawDraftInlineStyleRange
  extends Omit<RawDraftInlineStyleRange, 'style'> {
  style: DraftInlineStyleType | TextStyle.Subscript | TextStyle.Superscript
}

export default ReText
