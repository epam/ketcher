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
import { zoom, select, ZoomTransform, ZoomBehavior } from 'd3';
import { BaseTool } from 'application/editor/tools/Tool';
import { canvasSelector, drawnStructuresSelector } from '../constants';
import { D3SvgElementSelection } from 'application/render/types';
import { Vec2 } from 'domain/entities';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';

class ZoomTool implements BaseTool {
  private canvas: D3SvgElementSelection<SVGSVGElement, void>;
  private canvasWrapper: D3SvgElementSelection<SVGSVGElement, void>;
  private zoom: ZoomBehavior<SVGSVGElement, void>;
  private zoomLevel: number;
  private zoomTransform: ZoomTransform;
  drawingEntitiesManager: DrawingEntitiesManager;

  // eslint-disable-next-line no-use-before-define
  private static _instance: ZoomTool;
  public static get instance() {
    return ZoomTool._instance;
  }

  private constructor(drawingEntitiesManager: DrawingEntitiesManager) {
    const minZoomscale = 0.2;
    const maxZoomscale = 4;
    this.canvasWrapper = select(canvasSelector);
    this.canvas = select(drawnStructuresSelector);

    this.zoomLevel = 1;
    this.zoomTransform = new ZoomTransform(1, 0, 0);
    this.drawingEntitiesManager = drawingEntitiesManager;

    this.zoom = zoom<SVGSVGElement, void>()
      .scaleExtent([minZoomscale, maxZoomscale])
      .on('zoom', this.zoomAction.bind(this));
    this.canvasWrapper.call(this.zoom);
    this.addScrollZooming();
  }

  static getInstance(drawingEntitiesManager: DrawingEntitiesManager) {
    if (!ZoomTool._instance) {
      ZoomTool._instance = new ZoomTool(drawingEntitiesManager);
    }
    return ZoomTool._instance;
  }

  setZoom(zoomLevel: number) {
    this.zoomLevel = zoomLevel;
  }

  getZoomLevel() {
    return this.zoomLevel;
  }

  setZoomTransform(transform: ZoomTransform) {
    this.zoomTransform = transform;
  }

  zoomAction({ transform }) {
    this.canvas.attr('transform', transform);
    this.zoomLevel = transform.k;
    this.zoomTransform = transform;
  }

  addScrollZooming() {
    this.canvasWrapper.call(
      this.zoom
        .filter((e) => e.type === 'wheel')
        .on('zoom', this.zoomAction.bind(this)),
    );
  }

  subscribeMenuZoom() {
    const zoomStep = 0.1;
    select('.zoom-in').on('click', () => {
      this.zoom.scaleTo(this.canvasWrapper, this.zoomLevel + zoomStep);
    });
    select('.zoom-out').on('click', () => {
      this.zoom.scaleTo(this.canvasWrapper, this.zoomLevel - zoomStep);
    });
    select('.zoom-reset').on('click', () => {
      this.zoom.transform(this.canvasWrapper, new ZoomTransform(1, 0, 0));
    });
  }

  zoomExtraElement() {
    this.zoom.scaleTo(this.canvasWrapper, this.zoomLevel);
  }

  scaleCoordinates(position: Vec2) {
    const newX = this.zoomTransform.applyX(position.x);
    const newY = this.zoomTransform.applyY(position.y);
    return new Vec2(newX, newY);
  }

  invertZoom(position: Vec2) {
    const newX = this.zoomTransform.invertX(position.x);
    const newY = this.zoomTransform.invertY(position.y);
    return new Vec2(newX, newY);
  }

  unzoomValue(value: number) {
    return value / this.zoomLevel;
  }

  destroy() {}
}

export default ZoomTool;
