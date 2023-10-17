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
// import { CoreEditor } from 'application/editor';
import { zoom, select, ZoomTransform } from 'd3';
import { BaseTool } from 'application/editor/tools/Tool';
import { canvasSelector, drawnStructuresSelector } from '../constants';
import { D3SvgElementSelection } from 'application/render/types';
import { Vec2 } from 'domain/entities';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';

class ZoomTool implements BaseTool {
  private canvas: D3SvgElementSelection<SVGSVGElement, void>;
  private canvasWrapper: D3SvgElementSelection<SVGSVGElement, void>;
  private zoomLevel: number;
  private zoomTransform: ZoomTransform;
  private drawingEntitiesManager: DrawingEntitiesManager;
  // private zoomCenterShift: Vec2;

  constructor(drawingEntitiesManager: DrawingEntitiesManager) {
    // this.editor = editor;
    this.canvasWrapper = select(canvasSelector);
    this.canvas = select(drawnStructuresSelector);
    this.zoomLevel = 1;
    this.zoomTransform = new ZoomTransform(1, 0, 0);
    this.drawingEntitiesManager = drawingEntitiesManager;
    // this.zoomCenterShift = new Vec2(0, 0);
    this.addScrollZooming();
    // console.log(this.editor);
  }

  setZoom(zoomLevel: number) {
    this.zoomLevel = zoomLevel;
  }

  setZoomTransform(transform: ZoomTransform) {
    this.zoomTransform = transform;
  }

  // setZoomCenterShift(zoomCenterShift: Vec2) {
  //   this.zoomCenterShift = zoomCenterShift;
  // }

  addScrollZooming() {
    const boundingBox = this.canvasWrapper.node()?.getBBox();
    if (!boundingBox) {
      return;
    }
    this.canvasWrapper.call(
      zoom<SVGSVGElement, void>()
        .extent([
          [0, 0],
          [boundingBox.width, boundingBox.height],
        ])
        .scaleExtent([0.2, 4])
        .filter((e) => e.type === 'wheel')
        .on('zoom', ({ transform }) => {
          // this.drawingEntitiesManager.allEntities.forEach(([_, entity]) => {
          //   entity.moveAbsolute(this.invertZoom(entity.position));
          // });
          this.canvas.attr('transform', transform);
          this.zoomLevel = transform.k;
          this.zoomTransform = transform;
          // console.log(this.drawingEntitiesManager.allEntities);
          // this.zoomCenterShift = new Vec2(transform.x, transform.y);
        }),
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

  // scaleCoordinates = (position: Vec2) => {
  //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //   const canvas = this.canvas.node()!.getBBox();
  //   const centerX = canvas.width / 2 + this.zoomCenterShift.x;
  //   const centerY = canvas.height / 2 + this.zoomCenterShift.y;
  //   // let centerX, centerY;
  //   // if (center) {
  //   //   centerX = center.x;
  //   //   centerY = center.y;
  //   // } else {
  //   //   centerX = canvas.width / 2;
  //   //   centerY = canvas.height / 2;
  //   // }
  //   const relX = position.x - centerX;
  //   const relY = position.y - centerY;
  //   const scaledX = relX * this.zoomLevel;
  //   const scaledY = relY * this.zoomLevel;
  //   return new Vec2({ x: scaledX + centerX, y: scaledY + centerY });
  // };

  destroy() {}
}

let ZoomToolInstance;

const zoomProvider = {
  getZoomTool: (drawingEntitiesManager?: DrawingEntitiesManager) => {
    if (!ZoomToolInstance && drawingEntitiesManager) {
      ZoomToolInstance = new ZoomTool(drawingEntitiesManager);
    }
    return ZoomToolInstance;
  },
};

export { ZoomTool, zoomProvider };
