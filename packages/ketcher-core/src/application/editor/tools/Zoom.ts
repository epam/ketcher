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
import { zoom, select, ZoomTransform, ZoomBehavior, drag } from 'd3';
import { BaseTool } from 'application/editor/tools/Tool';
import { canvasSelector, drawnStructuresSelector } from '../constants';
import { D3SvgElementSelection } from 'application/render/types';
import { Vec2 } from 'domain/entities/vec2';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { clamp } from 'lodash';
import { notifyRenderComplete } from 'application/render/internal';

interface ScrollBar {
  name: string;
  offsetStart: number;
  offsetEnd: number;
  maxWidth: number;
  maxHeight: number;
  bar?: D3SvgElementSelection<SVGRectElement, void> | undefined;
}

class ZoomTool implements BaseTool {
  private canvas: D3SvgElementSelection<SVGSVGElement, void>;
  private canvasWrapper: D3SvgElementSelection<SVGSVGElement, void>;
  private zoom!: ZoomBehavior<SVGSVGElement, void> | null;
  private zoomLevel: number;
  private zoomTransform: ZoomTransform;
  private resizeObserver: ResizeObserver | null = null;
  drawingEntitiesManager: DrawingEntitiesManager;
  private zoomEventHandlers: Array<(transform?) => void> = [];
  private scrollBars!: {
    horizontal: ScrollBar;
    vertical: ScrollBar;
  };

  COLOR = '#a5afb9';
  MIN_LENGTH = 40;
  RADIUS = 2;
  MARGIN = 5;
  HORIZONTAL_DIST_TO_EDGE = 16;
  VERTICAL_DIST_TO_EDGE = 4;
  WIDTH = 4;
  MINZOOMSCALE = 0.2;
  MAXZOOMSCALE = 4;

  // eslint-disable-next-line no-use-before-define
  private static _instance: ZoomTool;
  public static get instance() {
    return ZoomTool._instance;
  }

  static initInstance(drawingEntitiesManager: DrawingEntitiesManager) {
    ZoomTool._instance = new ZoomTool(drawingEntitiesManager);
    return ZoomTool._instance;
  }

  private constructor(drawingEntitiesManager: DrawingEntitiesManager) {
    this.canvasWrapper = select(canvasSelector);
    this.canvas = select(drawnStructuresSelector);

    this.zoomLevel = 1;
    this.zoomTransform = new ZoomTransform(1, 0, 0);
    this.drawingEntitiesManager = drawingEntitiesManager;

    this.initActions();
  }

  initActions() {
    this.zoom = zoom<SVGSVGElement, void>()
      .scaleExtent([this.MINZOOMSCALE, this.MAXZOOMSCALE])
      .wheelDelta(this.defaultWheelDelta)
      .filter((e) => {
        e.preventDefault();
        if (e.ctrlKey && e.type === 'wheel') {
          return true;
        }
        return false;
      })
      .on('zoom', this.zoomAction.bind(this))
      .on('end', () => {
        notifyRenderComplete();
      });
    this.canvasWrapper.call(this.zoom);

    this.canvasWrapper.on('wheel', (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
      } else {
        this.mouseWheeled(event);
      }
    });
    this.initMenuZoom();
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
    this.drawScrollBars();
    requestAnimationFrame(() => {
      this.dispatchZoomEventHandlers(transform);
    });
  }

  subscribeOnZoomEvent(zoomEventHandler: (transform?) => void) {
    this.zoomEventHandlers.push(zoomEventHandler);
  }

  dispatchZoomEventHandlers(transform) {
    this.zoomEventHandlers.forEach((zoomEventHandler) => {
      zoomEventHandler(transform);
    });
  }

  drawScrollBars() {
    if (this.canvas.node() && this.canvasWrapper.node()) {
      this.initScrollBars();
      this.renderScrollBar(this.scrollBars.horizontal);
      this.renderScrollBar(this.scrollBars.vertical);
    }
  }

  renderScrollBar(scrollBar: ScrollBar) {
    const hasOffset = scrollBar.offsetStart < 0 || scrollBar.offsetEnd < 0;
    if (hasOffset) {
      if (scrollBar.bar) {
        this.updateScrollBarAttrs(scrollBar);
      } else {
        this.drawScrollBar(scrollBar);
      }
    } else {
      scrollBar.bar?.remove();
      scrollBar.bar = undefined;
    }
  }

  drawScrollBar(scrollBar: ScrollBar) {
    scrollBar.bar = this.canvasWrapper.append('rect');
    const dragged = drag().on(
      'drag',
      this.dragged(scrollBar.name).bind(this),
    ) as never;
    scrollBar.bar?.call(dragged);
    this.updateScrollBarAttrs(scrollBar);
  }

  updateScrollBarAttrs(scrollBar: ScrollBar) {
    const { start, length } = this.calculateDynamicAttr(scrollBar);

    if (scrollBar.name === 'horizontal') {
      scrollBar.bar
        ?.attr('x', start)
        .attr('y', scrollBar.maxHeight - this.HORIZONTAL_DIST_TO_EDGE)
        .attr('width', length)
        .attr('height', this.WIDTH);
    } else {
      scrollBar.bar
        ?.attr('x', scrollBar.maxHeight - this.VERTICAL_DIST_TO_EDGE)
        .attr('y', start)
        .attr('width', this.WIDTH)
        .attr('height', length);
    }

    scrollBar.bar
      ?.attr('rx', this.RADIUS)
      .attr('draggable', true)
      .attr('cursor', 'pointer')
      .attr('stroke', this.COLOR)
      .attr('fill', this.COLOR)
      .attr('data-testid', scrollBar.name + '-bar');
  }

  calculateDynamicAttr(scrollBar: ScrollBar) {
    const start = clamp(
      -scrollBar.offsetStart,
      this.MARGIN,
      scrollBar.maxWidth - this.MIN_LENGTH - this.MARGIN,
    );
    const end =
      scrollBar.maxWidth -
      clamp(-scrollBar.offsetEnd, this.MARGIN, scrollBar.maxWidth);
    const length = Math.max(end - start, this.MIN_LENGTH);
    return { start, length };
  }

  dragged = (name: string) => (event) => {
    if (name === 'horizontal') {
      this.zoom?.translateBy(this.canvasWrapper, -event.dx, 0);
    } else {
      this.zoom?.translateBy(this.canvasWrapper, 0, -event.dy);
    }
  };

  mouseWheeled(event) {
    const isShiftKeydown = event.shiftKey;
    const boxNode = this.canvasWrapper.node();
    if (boxNode && (event.deltaX || event.deltaY)) {
      const x = -event.deltaX / this.zoomLevel;
      const y = -event.deltaY / this.zoomLevel;
      if (isShiftKeydown) {
        this.zoom?.translateBy(this.canvasWrapper, x - y, 0);
      } else {
        this.zoom?.translateBy(this.canvasWrapper, x, y);
      }
    }
  }

  initScrollBars() {
    const boundingBox = this.canvas.node()?.getBoundingClientRect() as DOMRect;
    const wrapperBoundingBox = this.canvasWrapper
      .node()
      ?.getBoundingClientRect() as DOMRect;
    const canvasWrapperHeight =
      this.canvasWrapper.node()?.height.baseVal.value || 0;

    const canvasWrapperWidth =
      this.canvasWrapper.node()?.width.baseVal.value || 0;
    this.scrollBars = {
      horizontal: {
        name: 'horizontal',
        offsetStart: boundingBox.left - wrapperBoundingBox.left,
        offsetEnd: wrapperBoundingBox.width - boundingBox.right,
        maxWidth: canvasWrapperWidth,
        maxHeight: canvasWrapperHeight,
        bar: this.scrollBars?.horizontal?.bar,
      },
      vertical: {
        name: 'vertical',
        offsetStart: boundingBox.top - wrapperBoundingBox.top,
        offsetEnd: wrapperBoundingBox.height - boundingBox.bottom,
        maxWidth: canvasWrapperHeight,
        maxHeight: canvasWrapperWidth,
        bar: this.scrollBars?.vertical?.bar,
      },
    };
  }

  private get zoomStep() {
    return 0.1;
  }

  public zoomIn(zoomStep = this.zoomStep) {
    this.zoom?.scaleTo(this.canvasWrapper, this.zoomLevel + zoomStep);
  }

  public zoomOut(zoomStep = this.zoomStep) {
    this.zoom?.scaleTo(this.canvasWrapper, this.zoomLevel - zoomStep);
  }

  public resetZoom() {
    this.zoom?.transform(this.canvasWrapper, new ZoomTransform(1, 0, 0));
  }

  initMenuZoom() {
    select('.zoom-in').on('click', () => {
      this.zoomIn();
    });
    select('.zoom-out').on('click', () => {
      this.zoomOut();
    });
    select('.zoom-reset').on('click', () => {
      this.resetZoom();
    });
  }

  observeCanvasResize = () => {
    this.resizeObserver = new ResizeObserver(() => {
      this.drawScrollBars();
    });
    this.resizeObserver.observe(this.canvasWrapper.node() as SVGSVGElement);
  };

  defaultWheelDelta(event) {
    return (
      -event.deltaY *
      (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002)
    );
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

  destroy() {
    this.scrollBars.horizontal?.bar?.remove();
    this.scrollBars.vertical?.bar?.remove();
    this.resizeObserver?.unobserve(this.canvasWrapper.node() as SVGSVGElement);
    this.zoom = null;
    this.zoomEventHandlers = [];
  }
}

export default ZoomTool;
