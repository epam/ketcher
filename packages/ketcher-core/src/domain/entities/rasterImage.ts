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

import { BaseMicromoleculeEntity } from 'domain/entities/BaseMicromoleculeEntity';
import { Point, Vec2 } from 'domain/entities/vec2';
import { getNodeWithInvertedYCoord, KetFileNode } from 'domain/serializers';

interface KetFileNodeContent {
  bitmap: string;
  halfSize: Point;
}

export const RASTER_IMAGE_KEY = 'rasterImage';

export class RasterImage extends BaseMicromoleculeEntity {
  constructor(
    public bitmap: string,
    private _center: Vec2,
    private halfSize: Vec2,
  ) {
    super();
  }

  getTopLeftPosition(): Vec2 {
    return this._center.sub(this.halfSize);
  }

  getTopRightPosition(): Vec2 {
    return new Vec2(
      this._center.x + this.halfSize.x,
      this._center.y - this.halfSize.y,
    );
  }

  getBottomRightPosition(): Vec2 {
    return this._center.add(this.halfSize);
  }

  getBottomLeftPosition(): Vec2 {
    return new Vec2(
      this._center.x - this.halfSize.x,
      this._center.y + this.halfSize.y,
    );
  }

  getCornerPositions() {
    return [
      this.getTopLeftPosition(),
      this.getTopRightPosition(),
      this.getBottomRightPosition(),
      this.getBottomLeftPosition(),
    ];
  }

  clone(): RasterImage {
    return new RasterImage(
      this.bitmap,
      new Vec2(this._center),
      new Vec2(this.halfSize),
    );
  }

  addPositionOffset(offset: Vec2) {
    this._center = this._center.add(offset);
  }

  rescaleSize(scale: number): void {
    this.halfSize = this.halfSize.scaled(scale);
  }

  center(): Vec2 {
    return this._center;
  }

  isPointInsidePolygon(point: Vec2): boolean {
    return point.isInsidePolygon(this.getCornerPositions());
  }

  calculateDistanceToPoint(point: Vec2): number {
    if (this.isPointInsidePolygon(point)) {
      return 0;
    }
    const [
      topLeftPosition,
      topRightPosition,
      bottomRightPosition,
      bottomLeftPosition,
    ] = this.getCornerPositions();

    return Math.min(
      point.calculateDistanceToLine([topLeftPosition, topRightPosition]),
      point.calculateDistanceToLine([topRightPosition, bottomLeftPosition]),
      point.calculateDistanceToLine([bottomRightPosition, bottomLeftPosition]),
      point.calculateDistanceToLine([bottomLeftPosition, topLeftPosition]),
    );
  }

  toKetNode(): KetFileNode<KetFileNodeContent> {
    return {
      type: RASTER_IMAGE_KEY,
      center: getNodeWithInvertedYCoord(this._center),
      data: {
        bitmap: this.bitmap,
        halfSize: this.halfSize,
      },
    };
  }

  static fromKetNode(
    ketFileNode: KetFileNode<KetFileNodeContent>,
  ): RasterImage {
    const vectorCenter = new Vec2(
      getNodeWithInvertedYCoord(ketFileNode.center),
    );
    // Should be validated already
    const data = ketFileNode.data as KetFileNodeContent;
    const vectorHalfSize = new Vec2(data.halfSize);
    const rasterImage = new RasterImage(
      data.bitmap,
      vectorCenter,
      vectorHalfSize,
    );
    rasterImage.setInitiallySelected(ketFileNode.selected);
    return rasterImage;
  }
}
