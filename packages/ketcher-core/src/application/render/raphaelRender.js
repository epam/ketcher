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

export function Render(clientArea, opt) {
  let renderWidth = opt.width || clientArea.clientWidth - 10
  let renderHeight = opt.height || clientArea.clientHeight - 10
  renderWidth = renderWidth > 0 ? renderWidth : 0
  renderHeight = renderHeight > 0 ? renderHeight : 0

  this.userOpts = opt
  this.clientArea = clientArea
  this.paper = new Raphael(clientArea, renderWidth, renderHeight)
  this.sz = Vec2.ZERO
  this.ctab = new ReStruct(new Struct(), this)
  this.options = defaultOptions(this.userOpts)
}

Render.prototype.updateOptions = function (opts) {
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

Render.prototype.selectionPolygon = function (r) {
  return draw.selectionPolygon(this.paper, r, this.options)
}

Render.prototype.selectionLine = function (p0, p1) {
  return draw.selectionLine(this.paper, p0, p1, this.options)
}

Render.prototype.selectionRectangle = function (p0, p1) {
  return draw.selectionRectangle(this.paper, p0, p1, this.options)
}

Render.prototype.view2obj = function (p, isRelative) {
  let scroll = this.scrollPos()
  if (!this.useOldZoom) {
    p = p.scaled(1 / this.options.zoom)
    scroll = scroll.scaled(1 / this.options.zoom)
  }
  p = isRelative ? p : p.add(scroll).sub(this.options.offset)
  return Scale.scaled2obj(p, this.options)
}

Render.prototype.obj2view = function (v, isRelative) {
  let p = Scale.obj2scaled(v, this.options)
  p = isRelative
    ? p
    : p
        .add(this.options.offset)
        .sub(this.scrollPos().scaled(1 / this.options.zoom))
  if (!this.useOldZoom) p = p.scaled(this.options.zoom)
  return p
}

Render.prototype.scrollPos = function () {
  return new Vec2(this.clientArea.scrollLeft, this.clientArea.scrollTop)
}

Render.prototype.page2obj = function (event) {
  const clientArea = this.clientArea

  const { top: offsetTop, left: offsetLeft } =
    clientArea.getBoundingClientRect()

  const pp = new Vec2(event.clientX - offsetLeft, event.clientY - offsetTop)
  return this.view2obj(pp)
}

Render.prototype.setPaperSize = function (sz) {
  this.sz = sz
  this.paper.setSize(sz.x * this.options.zoom, sz.y * this.options.zoom)
  this.setViewBox(this.options.zoom)
}

Render.prototype.setOffset = function (newoffset) {
  const delta = new Vec2(
    newoffset.x - this.options.offset.x,
    newoffset.y - this.options.offset.y
  )
  this.clientArea.scrollLeft += delta.x
  this.clientArea.scrollTop += delta.y
  this.options.offset = newoffset
}

Render.prototype.setZoom = function (zoom) {
  // when scaling the canvas down it may happen that the scaled canvas is smaller than the view window
  // don't forget to call setScrollOffset after zooming (or use extendCanvas directly)
  this.options.zoom = zoom
  this.paper.setSize(this.sz.x * zoom, this.sz.y * zoom)
  this.setViewBox(zoom)
}

function calcExtend(canvasSize, x0, y0, newXSize, newYSize) {
  // eslint-disable-line max-params
  let ex = x0 < 0 ? -x0 : 0
  let ey = y0 < 0 ? -y0 : 0

  if (canvasSize.x < newXSize) {
    ex += newXSize - canvasSize.x
  }
  if (canvasSize.y < newYSize) {
    ey += newYSize - canvasSize.y
  }
  return new Vec2(ex, ey)
}

Render.prototype.setScrollOffset = function (x, y) {
  const clientArea = this.clientArea
  const cx = clientArea.clientWidth
  const cy = clientArea.clientHeight
  const e = calcExtend(
    this.sz.scaled(this.options.zoom),
    x,
    y,
    cx + Math.abs(x),
    cy + Math.abs(y)
  ).scaled(1 / this.options.zoom)
  if (e.x > 0 || e.y > 0) {
    this.setPaperSize(this.sz.add(e))
    const d = new Vec2(x < 0 ? -x : 0, y < 0 ? -y : 0).scaled(
      1 / this.options.zoom
    )
    if (d.x > 0 || d.y > 0) {
      this.ctab.translate(d)
      this.setOffset(this.options.offset.add(d))
    }
  }
  // clientArea.scrollLeft = x
  // clientArea.scrollTop = y
  clientArea.scrollLeft = x * this.options.scale
  clientArea.scrollTop = y * this.options.scale
  // TODO: store drag position in scaled systems
  // scrollLeft = clientArea.scrollLeft;
  // scrollTop = clientArea.scrollTop;
  this.update(false)
}

Render.prototype.setScale = function (z) {
  if (this.options.offset) {
    this.options.offset = this.options.offset.scaled(1 / z).scaled(z)
  }
  this.userOpts.scale *= z
  this.options = null
  this.update(true)
}

Render.prototype.setViewBox = function (z) {
  if (!this.useOldZoom) {
    this.paper.canvas.setAttribute(
      'viewBox',
      '0 0 ' + this.sz.x + ' ' + this.sz.y
    )
  } else this.setScale(z)
}

Render.prototype.setMolecule = function (ctab) {
  this.paper.clear()
  this.ctab = new ReStruct(ctab, this)
  this.options.offset = new Vec2()
  this.update(false)
}

Render.prototype.update = function (
  force = false,
  viewSz = null,
  options = {
    resizeCanvas: true
  }
) {
  // eslint-disable-line max-statements
  viewSz =
    viewSz ||
    new Vec2(
      this.clientArea.clientWidth || 100,
      this.clientArea.clientHeight || 100
    )

  const changes = this.ctab.update(force)
  this.ctab.setSelection() // [MK] redraw the selection bits where necessary
  if (changes) {
    const scale = this.options.scale
    const bb = this.ctab
      .getVBoxObj()
      .transform(Scale.obj2scaled, this.options)
      .translate(this.options.offset || new Vec2())

    if (this.options.downScale) {
      this.ctab.molecule.rescale()
    }

    const isAutoScale = this.options.autoScale || this.options.downScale
    if (!isAutoScale) {
      const ext = Vec2.UNIT.scaled(scale)
      const eb = bb.sz().length() > 0 ? bb.extend(ext, ext) : bb
      const vb = new Box2Abs(
        this.scrollPos(),
        viewSz.scaled(1 / this.options.zoom).sub(Vec2.UNIT.scaled(20))
      )
      const cb = Box2Abs.union(vb, eb)
      if (!this.oldCb) this.oldCb = new Box2Abs()

      const sz = cb.sz().floor()
      const delta = this.oldCb.p0.sub(cb.p0).ceil()
      this.oldBb = bb
      const shouldResizeCanvas =
        (!this.sz || sz.x !== this.sz.x || sz.y !== this.sz.y) &&
        options.resizeCanvas
      if (shouldResizeCanvas) {
        this.setPaperSize(sz)
      }

      this.options.offset = this.options.offset || new Vec2()
      const shouldScrollCanvas =
        (delta.x !== 0 || delta.y !== 0) && options.resizeCanvas
      if (shouldScrollCanvas) {
        this.setOffset(this.options.offset.add(delta))
        this.ctab.translate(delta)
      }
    } else {
      const sz1 = bb.sz()
      const marg = this.options.autoScaleMargin
      const mv = new Vec2(marg, marg)
      const csz = viewSz
      if (marg && (csz.x < 2 * marg + 1 || csz.y < 2 * marg + 1)) {
        throw new Error('View box too small for the given margin')
      }
      let rescale =
        this.options.rescaleAmount ||
        Math.max(sz1.x / (csz.x - 2 * marg), sz1.y / (csz.y - 2 * marg))

      const isForceDownscale = this.options.downScale && rescale < 1
      const isBondsLengthFit = this.options.maxBondLength / rescale > 1
      if (isBondsLengthFit || isForceDownscale) {
        rescale = 1
      }
      const sz2 = sz1.add(mv.scaled(2 * rescale))
      /* eslint-disable no-mixed-operators */
      this.paper.setViewBox(
        bb.pos().x - marg * rescale - (csz.x * rescale - sz2.x) / 2,
        bb.pos().y - marg * rescale - (csz.y * rescale - sz2.y) / 2,
        csz.x * rescale,
        csz.y * rescale
      )
      /* eslint-enable no-mixed-operators */
    }
  }
}
