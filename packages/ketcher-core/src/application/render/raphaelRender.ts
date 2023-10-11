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

import { Box2Abs, Struct, Vec2 } from 'domain/entities';
import { RaphaelPaper } from 'raphael';

import Raphael from './raphael-ext';
import { ReStruct } from './restruct';
import { Scale } from 'domain/helpers';
import defaultOptions from './options';
import draw from './draw';
import { RenderOptions, ViewBox } from './render.types';
import _ from 'lodash';
import { KetcherLogger } from 'utilities';
import { CoordinateTransformation } from './coordinateTransformation';
import { ScrollbarContainer } from './scrollbar';

const notifyRenderComplete = _.debounce(() => {
  const event = new Event('renderComplete');
  window.dispatchEvent(event);
}, 500);

export class Render {
  public skipRaphaelInitialization = false;
  public readonly clientArea: HTMLElement;
  public readonly paper: RaphaelPaper;
  // TODO https://github.com/epam/ketcher/issues/2631
  public sz: Vec2;
  // TODO https://github.com/epam/ketcher/issues/2630
  public ctab: ReStruct;
  public options: RenderOptions;
  public viewBox!: ViewBox;
  private readonly userOpts: RenderOptions;
  private oldCb: Box2Abs | null = null;
  private scrollbar: ScrollbarContainer;

  constructor(clientArea: HTMLElement, options: RenderOptions) {
    let renderWidth = options.width || clientArea.clientWidth - 10;
    let renderHeight = options.height || clientArea.clientHeight - 10;
    renderWidth = renderWidth > 0 ? renderWidth : 0;
    renderHeight = renderHeight > 0 ? renderHeight : 0;

    this.userOpts = options;
    this.clientArea = clientArea;
    this.paper = new Raphael(clientArea, renderWidth, renderHeight);
    this.sz = new Vec2(renderWidth, renderHeight);
    this.ctab = new ReStruct(new Struct(), this);
    this.options = defaultOptions(this.userOpts);
    this.scrollbar = new ScrollbarContainer(this);
    this.setViewBox({
      minX: 0,
      minY: 0,
      width: renderWidth,
      height: renderHeight,
    });
  }

  updateOptions(opts: string) {
    try {
      const passedOptions = JSON.parse(opts);
      if (passedOptions && typeof passedOptions === 'object') {
        this.options = { ...this.options, ...passedOptions };
        return this.options;
      }
    } catch (e) {
      KetcherLogger.error('raphaelRenderer.ts::updateOptions', e);
      console.log('Not a valid settings object');
    }
    return false;
  }

  selectionPolygon(polygon: Vec2[]) {
    return draw.selectionPolygon(this.paper, polygon, this.options);
  }

  selectionLine(point0: Vec2, point1: Vec2) {
    return draw.selectionLine(this.paper, point0, point1, this.options);
  }

  selectionRectangle(point0: Vec2, point1: Vec2) {
    return draw.selectionRectangle(this.paper, point0, point1, this.options);
  }

  // @yuleicul Todo: refactor all references of `page2obj` to `CoordinateTransformation.pageEventToProto(event, this)`
  page2obj(event: MouseEvent | { clientX: number; clientY: number }) {
    return CoordinateTransformation.pageEventToProto(event, this);
  }

  // TODO: @yuleicul remove or handle media size change
  setPaperSize(newSize: Vec2) {
    this.sz = newSize;
    this.paper.setSize(newSize.x, newSize.y);
  }

  setOffset(newOffset: Vec2): void {
    const delta = new Vec2(
      newOffset.x - this.options.offset.x,
      newOffset.y - this.options.offset.y,
    );
    this.clientArea.scrollLeft += delta.x;
    this.clientArea.scrollTop += delta.y;
    this.options.offset = newOffset;
  }

  setZoom(zoom: number, event?: WheelEvent) {
    const zoomedWidth = this.sz.x / zoom;
    const zoomedHeight = this.sz.y / zoom;
    const [viewBoxX, viewBoxY] = event
      ? this.zoomOnMouse(event, zoomedWidth, zoomedHeight)
      : this.zoomOnCanvasCenter(zoomedWidth, zoomedHeight);
    this.setViewBox({
      minX: viewBoxX,
      minY: viewBoxY,
      width: zoomedWidth,
      height: zoomedHeight,
    });

    this.options.zoom = zoom;
  }

  private zoomOnCanvasCenter(zoomedWidth: number, zoomedHeight: number) {
    const fixedPoint = new Vec2(
      this.viewBox.minX + this.viewBox.width / 2,
      this.viewBox.minY + this.viewBox.height / 2,
    );
    const viewBoxX = fixedPoint.x - zoomedWidth / 2;
    const viewBoxY = fixedPoint.y - zoomedHeight / 2;
    return [viewBoxX, viewBoxY];
  }

  private zoomOnMouse(
    event: WheelEvent,
    zoomedWidth: number,
    zoomedHeight: number,
  ) {
    const fixedPoint = CoordinateTransformation.pageEventToCanvas(event, this);
    const widthRatio = (fixedPoint.x - this.viewBox.minX) / this.viewBox.width;
    const heightRatio =
      (fixedPoint.y - this.viewBox.minY) / this.viewBox.height;
    const viewBoxX = fixedPoint.x - zoomedWidth * widthRatio;
    const viewBoxY = fixedPoint.y - zoomedHeight * heightRatio;
    return [viewBoxX, viewBoxY];
  }

  setScrollOffset(x: number, y: number) {
    const clientArea = this.clientArea;
    const cx = clientArea.clientWidth;
    const cy = clientArea.clientHeight;
    const e = calcExtend(
      this.sz.scaled(this.options.zoom),
      x,
      y,
      cx + Math.abs(x),
      cy + Math.abs(y),
    ).scaled(1 / this.options.zoom);
    if (e.x > 0 || e.y > 0) {
      // remove setpaper size except for initial
      const d = new Vec2(x < 0 ? -x : 0, y < 0 ? -y : 0).scaled(
        1 / this.options.zoom,
      );
      if (d.x > 0 || d.y > 0) {
        this.ctab.translate(d);
        this.setOffset(this.options.offset.add(d));
      }
    }
    // clientArea.scrollLeft = x
    // clientArea.scrollTop = y
    clientArea.scrollLeft = x * this.options.scale;
    clientArea.scrollTop = y * this.options.scale;
    // TODO: store drag position in scaled systems
    // scrollLeft = clientArea.scrollLeft;
    // scrollTop = clientArea.scrollTop;
    this.update(false);
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/viewBox
   */
  setViewBox(func: (viewBox: ViewBox) => ViewBox): void;
  setViewBox(viewBox: ViewBox): void;
  setViewBox(arg: ViewBox | ((viewBox: ViewBox) => ViewBox)): void {
    const newViewBox = typeof arg === 'function' ? arg(this.viewBox) : arg;
    this.viewBox = newViewBox;
    this.paper.canvas.setAttribute(
      'viewBox',
      `${newViewBox.minX} ${newViewBox.minY} ${newViewBox.width} ${newViewBox.height}`,
    );
    this.scrollbar.update();
  }

  setMolecule(struct: Struct) {
    this.paper.clear();
    this.ctab = new ReStruct(struct, this);
    this.options.offset = new Vec2();
    this.update(false);
  }

  update(force = false, viewSz: Vec2 | null = null) {
    // eslint-disable-line max-statements
    viewSz =
      viewSz ||
      new Vec2(
        this.clientArea.clientWidth || 100,
        this.clientArea.clientHeight || 100,
      );

    const changes = this.ctab.update(force);
    this.ctab.setSelection(); // [MK] redraw the selection bits where necessary
    if (changes) {
      const bb = this.ctab
        .getVBoxObj()
        .transform(Scale.protoToCanvas, this.options)
        .translate(this.options.offset || new Vec2());

      if (this.options.downScale) {
        this.ctab.molecule.rescale();
      }

      const isAutoScale = this.options.autoScale || this.options.downScale;
      if (!isAutoScale) {
        if (!this.oldCb) this.oldCb = new Box2Abs();

        this.options.offset = this.options.offset || new Vec2();
      } else {
        const sz1 = bb.sz();
        const marg = this.options.autoScaleMargin;
        const mv = new Vec2(marg, marg);
        const csz = viewSz;
        if (marg && (csz.x < 2 * marg + 1 || csz.y < 2 * marg + 1)) {
          throw new Error('View box too small for the given margin');
        }
        let rescale =
          this.options.rescaleAmount ||
          Math.max(sz1.x / (csz.x - 2 * marg), sz1.y / (csz.y - 2 * marg));

        const isForceDownscale = this.options.downScale && rescale < 1;
        const isBondsLengthFit = this.options.maxBondLength / rescale > 1;
        if (isBondsLengthFit || isForceDownscale) {
          rescale = 1;
        }
        const sz2 = sz1.add(mv.scaled(2 * rescale));
        this.paper.setViewBox(
          bb.pos().x - marg * rescale - (csz.x * rescale - sz2.x) / 2,
          bb.pos().y - marg * rescale - (csz.y * rescale - sz2.y) / 2,
          csz.x * rescale,
          csz.y * rescale,
        );
      }

      this.scrollbar.update();
      notifyRenderComplete();
    }
  }
}

function calcExtend(
  canvasSize: Vec2,
  x0: number,
  y0: number,
  newXSize: number,
  newYSize: number,
): Vec2 {
  // eslint-disable-line max-params
  let ex = x0 < 0 ? -x0 : 0;
  let ey = y0 < 0 ? -y0 : 0;

  if (canvasSize.x < newXSize) {
    ex += newXSize - canvasSize.x;
  }
  if (canvasSize.y < newYSize) {
    ey += newYSize - canvasSize.y;
  }
  return new Vec2(ex, ey);
}
