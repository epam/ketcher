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
  DraftInlineStyleType,
  RawDraftContentBlock,
  RawDraftContentState,
  RawDraftInlineStyleRange
} from 'draft-js'
import { Text, TextCommand, Vec2 } from 'domain/entities'
import { flatten, isEqual } from 'lodash/fp'

import { LayerMap } from './generalEnumTypes'
import ReObject from './reobject'
import ReStruct from './restruct'
import { Scale } from 'domain/helpers'
import { RaphaelBaseElement } from 'raphael'

interface CustomRawDraftInlineStyleRange
  extends Omit<RawDraftInlineStyleRange, 'style'> {
  style:
    | DraftInlineStyleType
    | TextCommand.Subscript
    | TextCommand.Superscript
    | TextCommand.FontSize
}

const SCALE = 40 // from ketcher-core

class ReText extends ReObject {
  private item: Text
  paths: Array<Array<RaphaelBaseElement>> = []

  constructor(text: Text) {
    super('text')
    this.item = text
  }

  static isSelectable() {
    return true
  }

  getReferencePoints(): Array<Vec2> {
    if (!this.paths.length) return []

    const { p0, p1 } = this.getRelBox(this.paths)

    const p = this.item.position
    const width = Math.abs(Vec2.diff(p0, p1).x) / SCALE
    const height = Math.abs(Vec2.diff(p0, p1).y) / SCALE

    const refPoints: Array<Vec2> = []

    refPoints.push(
      this.item.position,
      new Vec2(p.x, p.y + height),
      new Vec2(p.x + width, p.y + height),
      new Vec2(p.x + width, p.y)
    )

    return refPoints
  }

  hoverPath(render: any): any {
    const { p0, p1 } = this.getRelBox(this.paths)
    const topLeft = p0.sub(render.options.offset)
    const { x: width, y: height } = p1.sub(p0)

    return render.paper.rect(topLeft.x, topLeft.y, width, height, 5)
  }

  getRelBox(paths: Array<Array<RaphaelBaseElement>>): { p0: Vec2; p1: Vec2 } {
    const firstElOfFirstRow: RaphaelBaseElement = paths[0][0]
    const leftEdge = firstElOfFirstRow.getBBox().x

    const firstRow: Array<RaphaelBaseElement> = paths[0]
    const topEdge: number = Math.min(
      ...firstRow.map((path) => path.getBBox().y)
    )

    const widestRow: Array<RaphaelBaseElement> = paths.reduce(
      (widestRow, nextRow) =>
        this.getRowWidth(nextRow) > this.getRowWidth(widestRow)
          ? nextRow
          : widestRow,
      paths[0]
    )
    const lastElOfWidestRow: RaphaelBaseElement =
      widestRow[widestRow.length - 1]
    const rightEdge: number =
      lastElOfWidestRow.getBBox().x + lastElOfWidestRow.getBBox().width

    const lastRow: Array<RaphaelBaseElement> = paths[paths.length - 1]
    const bottomEdge: number = Math.max(
      ...lastRow.map((path) => path.getBBox().y + path.getBBox().height)
    )

    return {
      p0: new Vec2(leftEdge, topEdge),
      p1: new Vec2(rightEdge, bottomEdge)
    }
  }

  getRowWidth(row: Array<RaphaelBaseElement>): number {
    return row.reduce((rowWidth, nextRow) => {
      rowWidth += nextRow.getBBox().width
      return rowWidth
    }, 0)
  }

  drawHover(render: any): any {
    if (!this.paths.length) return null
    const ret = this.hoverPath(render).attr(render.options.hoverStyle)
    render.ctab.addReObjectPath(LayerMap.hovering, this.visel, ret)
    return ret
  }

  makeSelectionPlate(restruct: ReStruct, paper: any, options: any): any {
    if (!this.paths.length || !paper) return null
    return this.hoverPath(restruct.render).attr(options.selectionStyle)
  }

  show(restruct: ReStruct, _id: number, options: any): void {
    const render = restruct.render
    const paper = render.paper
    const paperScale = Scale.obj2scaled(this.item.position!, options)

    let shiftY = 0
    this.paths = []
    // TODO: create parser in ketcher-core package
    const rawContentState: RawDraftContentState | null = this.item.content
      ? (JSON.parse(this.item.content) as RawDraftContentState)
      : null
    if (!rawContentState) {
      return
    }

    rawContentState.blocks.forEach((block: RawDraftContentBlock) => {
      const ranges: Array<[number, number, Record<string, any>]> =
        this.getRanges(block, options)
      let shiftX = 0
      const row: Array<RaphaelBaseElement> = []
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

      const { p0, p1 } = this.getRelBox([row])
      shiftY += Math.abs(Vec2.diff(p0, p1).y)
    })

    this.item.setPos(this.getReferencePoints())

    render.ctab.addReObjectPath(
      LayerMap.data,
      this.visel,
      flatten(this.paths),
      null,
      true
    )
  }

  getRanges(
    block: RawDraftContentBlock,
    options: any
  ): Array<[number, number, Record<string, any>]> {
    const ranges: Array<[number, number, Record<string, any>]> = []

    let start = 0
    let styles: Record<string, any> = this.getStyles(block, start, options)
    for (let i = 1; i < block.text.length; i++) {
      const nextStyles = this.getStyles(block, i, options)

      if (!isEqual(styles, nextStyles)) {
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
    const ranges = block.inlineStyleRanges.filter(
      (inlineRange: CustomRawDraftInlineStyleRange) =>
        inlineRange.offset <= index &&
        index < inlineRange.offset + inlineRange.length
    )

    const customFontSize: number | null = ranges.reduce(
      (acc: number | null, range: any) => {
        if (range.style.includes(TextCommand.FontSize)) {
          return range.style.match(/\d+/)?.[0]
        }
        return acc
      },
      null
    )

    return ranges.reduce(
      (styles: any, textRange: CustomRawDraftInlineStyleRange) => {
        const fontsz = customFontSize || options.fontsz
        const fontszsub = (customFontSize || options.fontszsub) * 0.8
        switch (textRange.style) {
          case TextCommand.Bold:
            styles['font-weight'] = 'bold'
            break

          case TextCommand.Italic:
            styles['font-style'] = 'italic'
            break

          case TextCommand.Subscript:
            styles['font-size'] = fontszsub + 'px'
            styles.shiftY = fontsz / 3

            break

          case TextCommand.Superscript:
            styles['font-size'] = fontszsub + 'px'
            styles.shiftY = -fontsz / 3
            break

          case `${TextCommand.FontSize}_${customFontSize}px`:
            styles['font-size'] = customFontSize + 'px'
            break

          default:
        }

        return styles
      },
      {}
    )
  }
}

export default ReText
