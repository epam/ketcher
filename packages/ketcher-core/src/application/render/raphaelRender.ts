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

import { Box2Abs, Struct, Vec2 } from 'domain/entities'

import Raphael from './raphael-ext'
import { ReStruct } from './restruct'
import { Scale } from 'domain/helpers'
import defaultOptions from './options'
import draw from './draw'
import { RaphaelPaper } from 'raphael'

function calcExtend(
  scaledSz: Vec2,
  x0: number,
  y0: number,
  x1: number,
  y1: number
) {
  // eslint-disable-line max-params
  let ex = x0 < 0 ? -x0 : 0
  let ey = y0 < 0 ? -y0 : 0

  if (scaledSz.x < x1) ex += x1 - scaledSz.x
  if (scaledSz.y < y1) ey += y1 - scaledSz.y
  return new Vec2(ex, ey)
}

class Render {
  public clientArea: HTMLElement
  private userOpts: any
  public paper: RaphaelPaper
  private sz: Vec2
  public ctab: ReStruct
  public options: any
  private renderWidth: number
  private renderHeight: number
  private useOldZoom: boolean
  private oldCb: Box2Abs | null

  constructor(clientArea: HTMLElement, opt: any) {
    this.userOpts = opt
    this.clientArea = clientArea
    this.renderWidth =
      clientArea.clientWidth - 10 > 0 ? clientArea.clientWidth - 10 : 0
    this.renderHeight =
      clientArea.clientHeight - 10 > 0 ? clientArea.clientHeight - 10 : 0
    this.paper = new Raphael(clientArea, this.renderWidth, this.renderHeight)
    this.sz = Vec2.ZERO
    this.ctab = new ReStruct(new Struct(), this)
    this.options = defaultOptions(this.userOpts)
    this.useOldZoom = false // where it comes from?
    this.oldCb = null // where it comes from?
  }

  updateOptions(opts) {
    try {
      const passedOptions = JSON.parse(opts)
      if (passedOptions && typeof passedOptions === 'object') {
        this.options = { ...this.options, ...passedOptions }
        return this.options
      }
    } catch (e) {
      console.log('Not a valid settings object')
    }
    return false
  }

  selectionPolygon(r) {
    return draw.selectionPolygon(this.paper, r, this.options)
  }

  selectionLine(p0: Vec2, p1: Vec2) {
    return draw.selectionLine(this.paper, p0, p1, this.options)
  }

  selectionRectangle(p0: Vec2, p1: Vec2) {
    return draw.selectionRectangle(this.paper, p0, p1, this.options)
  }

  scrollPos() {
    return new Vec2(this.clientArea.scrollLeft, this.clientArea.scrollTop)
  }

  view2obj(p: Vec2, isRelative?: boolean) {
    let scroll = this.scrollPos()
    if (!this.useOldZoom) {
      p = p.scaled(1 / this.options.zoom)
      scroll = scroll.scaled(1 / this.options.zoom)
    }
    p = isRelative ? p : p.add(scroll).sub(this.options.offset)
    return Scale.scaled2obj(p, this.options)
  }

  obj2view(v: Vec2, isRelative: boolean) {
    let p = Scale.obj2scaled(v, this.options)
    p = isRelative
      ? p
      : p
          .add(this.options.offset)
          .sub(this.scrollPos().scaled(1 / this.options.zoom))
    if (!this.useOldZoom) p = p.scaled(this.options.zoom)
    return p
  }

  page2obj(event: MouseEvent) {
    const clientArea = this.clientArea
    const { top: offsetTop, left: offsetLeft } =
      clientArea.getBoundingClientRect()

    const pp = new Vec2(event.clientX - offsetLeft, event.clientY - offsetTop)
    return this.view2obj(pp)
  }

  setScale(z: number) {
    if (this.options.offset) {
      this.options.offset = this.options.offset.scaled(1 / z).scaled(z)
    }
    this.userOpts.scale *= z
    this.options = null
    this.update(true)
  }

  setViewBox(z: number) {
    if (!this.useOldZoom) {
      this.paper.canvas.setAttribute(
        'viewBox',
        '0 0 ' + this.sz.x + ' ' + this.sz.y
      )
    } else {
      this.setScale(z)
    }
  }

  setPaperSize(sz: Vec2) {
    this.sz = sz
    this.paper.setSize(sz.x * this.options.zoom, sz.y * this.options.zoom)
    this.setViewBox(this.options.zoom)
  }

  setOffset(newoffset: Vec2) {
    // console.log('setOffset')
    const delta = new Vec2(
      newoffset.x - this.options.offset.x,
      newoffset.y - this.options.offset.y
    )
    this.clientArea.scrollLeft += delta.x
    this.clientArea.scrollTop += delta.y
    this.options.offset = newoffset
  }

  setScrollOffset(x: number, y: number) {
    // console.log(666, 'Before: this.sz', this.sz)
    // console.log(666, 'Before: this.options.offset', this.options.offset)
    // console.log(
    // 666,
    // 'Before: clientArea.scroll',
    // this.clientArea.scrollLeft,
    // this.clientArea.scrollTop
    // )
    // console.log(666, 'Before: this.scrollPos', this.scrollPos())
    // console.log(
    // 666,
    // 'Before: clientArea',
    // this.clientArea.clientWidth,
    // this.clientArea.clientHeight
    // )

    const clientArea = this.clientArea
    const cx = clientArea.clientWidth
    const cy = clientArea.clientHeight
    // const cx = clientArea.clientWidth / this.options.scale
    // const cy = clientArea.clientHeight / this.options.scale
    const extend = calcExtend(
      this.sz.scaled(this.options.zoom),
      x,
      y,
      cx + x,
      cy + y
    ).scaled(1 / this.options.zoom)

    // const extend = calcExtend(
    // this.options.scale,
    // this.sz.scaled(this.options.zoom),
    // x,
    // y,
    // cx + x,
    // cy + y
    // ).scaled(1 / this.options.zoom)
    // console.log(888, 'e', extend)

    if (extend.x > 0 || extend.y > 0) {
      // console.log('extend!')
      this.setPaperSize(this.sz.add(extend))
      const d = new Vec2(x < 0 ? -x : 0, y < 0 ? -y : 0).scaled(
        1 / this.options.zoom
      )
      // console.log(2222, 'd: ', d)
      if (d.x > 0 || d.y > 0) {
        this.ctab.translate(d)
        this.setOffset(this.options.offset.add(d))
      }
    }

    // clientArea.scrollLeft = x * this.options.scale
    // clientArea.scrollTop = y * this.options.scale
    clientArea.scrollLeft = x
    clientArea.scrollTop = y

    // console.log(777, 'After: this.sz', this.sz)
    // console.log(777, 'After: this.options.offset', this.options.offset)
    // console.log(
    // 777,
    // 'After: clientArea.scroll',
    // this.clientArea.scrollLeft,
    // this.clientArea.scrollTop
    // )
    // console.log(777, 'After: this.scrollPos', this.scrollPos())

    // TODO: store drag position in scaled systems
    // scrollLeft = clientArea.scrollLeft;
    // scrollTop = clientArea.scrollTop;

    this.update(false)
  }

  setZoom(zoom: number) {
    // when scaling the canvas down it may happen that the scaled canvas is smaller than the view window
    // don't forget to call setScrollOffset after zooming (or use extendCanvas directly)
    this.options.zoom = zoom
    this.paper.setSize(this.sz.x * zoom, this.sz.y * zoom)
    this.setViewBox(zoom)
  }

  setMolecule(struct: Struct) {
    this.paper.clear()
    this.ctab = new ReStruct(struct, this)

    this.options.offset = new Vec2()
    this.update(false)
  }

  update(force = false, viewSz: Vec2 | null = null) {
    viewSz =
      viewSz ||
      new Vec2(
        this.clientArea.clientWidth || 100,
        this.clientArea.clientHeight || 100
      )

    const changes = this.ctab.update(force)
    this.ctab.setSelection() // [MK] redraw the selection bits where necessary

    if (changes) {
      const boundingBox = this.ctab
        ?.getVBoxObj()
        ?.transform(Scale.obj2scaled, this.options)
        .translate(this.options.offset || new Vec2())

      if (!this.options.autoScale && boundingBox) {
        const ext = Vec2.UNIT.scaled(this.options.scale)
        const extendedBox =
          boundingBox.sz().length() > 0
            ? boundingBox.extend(ext, ext)
            : boundingBox
        const viewBox = new Box2Abs(
          this.scrollPos(),
          viewSz.scaled(1 / this.options.zoom).sub(Vec2.UNIT.scaled(20))
        )
        const cb = Box2Abs.union(viewBox, extendedBox)
        if (!this.oldCb) {
          this.oldCb = new Box2Abs()
        }

        const sz = cb.sz().floor()
        const delta = this.oldCb.p0.sub(cb.p0).ceil()
        // TODO: do we need this.oldBb? Seem it's not in use
        // this.oldBb = bb
        if (!this.sz || sz.x !== this.sz.x || sz.y !== this.sz.y) {
          this.setPaperSize(sz)
        }

        this.options.offset = this.options.offset || new Vec2()
        if (delta.x !== 0 || delta.y !== 0) {
          this.setOffset(this.options.offset.add(delta))
          this.ctab.translate(delta)
        }
      } else {
        if (!boundingBox) {
          return
        }
        const sz1 = boundingBox.sz()
        const marg = this.options.autoScaleMargin
        const mv = new Vec2(marg, marg)
        const csz = viewSz
        if (csz.x < 2 * marg + 1 || csz.y < 2 * marg + 1) {
          throw new Error('View box too small for the given margin')
        }
        let rescale = Math.max(
          sz1.x / (csz.x - 2 * marg),
          sz1.y / (csz.y - 2 * marg)
        )
        if (this.options.maxBondLength / rescale > 1.0) rescale = 1.0
        const sz2 = sz1.add(mv.scaled(2 * rescale))
        /* eslint-disable no-mixed-operators */
        this.paper.setViewBox(
          boundingBox.pos().x - marg * rescale - (csz.x * rescale - sz2.x) / 2,
          boundingBox.pos().y - marg * rescale - (csz.y * rescale - sz2.y) / 2,
          csz.x * rescale,
          csz.y * rescale
        )
        /* eslint-enable no-mixed-operators */
      }
    }
  }
}

export { Render }
