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
  private resizeObserver: ResizeObserver | null = null;

  constructor(clientArea: HTMLElement, options: RenderOptions) {
    this.userOpts = options;
    this.clientArea = clientArea;
    this.paper = new Raphael(
      clientArea,
      options.width || '100%',
      options.height || '100%',
    );
    this.sz = this.getCanvasSizeVector();
    this.ctab = new ReStruct(new Struct(), this);
    this.options = defaultOptions(this.userOpts);
    this.scrollbar = new ScrollbarContainer(this);
    this.setViewBox({
      minX: 0,
      minY: 0,
      width: this.sz.x,
      height: this.sz.y,
    });
  }

  observeCanvasResize = () => {
    this.resizeObserver = new ResizeObserver(() => {
      this.sz = new Vec2(
        this.clientArea.clientWidth,
        this.clientArea.clientHeight,
      );
      this.resizeViewBox();
    });

    this.resizeObserver.observe(this.paper.canvas);
  };

  unobserveCanvasResize = () => {
    this.resizeObserver?.unobserve(this.paper.canvas);
  };

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

  /** @deprecated recommend using `CoordinateTransformation.pageToModel` instead */
  page2obj(event: MouseEvent | { clientX: number; clientY: number }) {
    return CoordinateTransformation.pageToModel(event, this);
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

  private getCanvasSizeVector() {
    return new Vec2(this.clientArea.clientWidth, this.clientArea.clientHeight);
  }

  resizeViewBox() {
    this.sz = this.getCanvasSizeVector();
    const newWidth = this.sz.x / this.options.zoom;
    const newHeight = this.sz.y / this.options.zoom;
    this.setViewBox((prev) => ({
      ...prev,
      width: newWidth,
      height: newHeight,
    }));
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
    const fixedPoint = CoordinateTransformation.pageToCanvas(event, this);
    const widthRatio = (fixedPoint.x - this.viewBox.minX) / this.viewBox.width;
    const heightRatio =
      (fixedPoint.y - this.viewBox.minY) / this.viewBox.height;
    const viewBoxX = fixedPoint.x - zoomedWidth * widthRatio;
    const viewBoxY = fixedPoint.y - zoomedHeight * heightRatio;
    return [viewBoxX, viewBoxY];
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
        this.scrollbar.update();
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

      notifyRenderComplete();
    }
  }
}
