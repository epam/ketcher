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
import { RASTER_IMAGE_SERIALIZE_KEY } from 'domain/constants';

interface KetFileNodeContent {
  bitmap: string;
  halfSize: Point;
}

export interface RasterImageReferencePositions {
  topLeftPosition: Vec2;
  topMiddlePosition: Vec2;
  topRightPosition: Vec2;
  rightMiddlePosition: Vec2;
  bottomRightPosition: Vec2;
  bottomMiddlePosition: Vec2;
  bottomLeftPosition: Vec2;
  leftMiddlePosition: Vec2;
}

export type RasterImageReferenceName = keyof RasterImageReferencePositions;

export interface RasterImageReferencePositionInfo {
  name: RasterImageReferenceName;
  offset: Vec2;
}

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

  getReferencePositions(): RasterImageReferencePositions {
    const [
      topLeftPosition,
      topRightPosition,
      bottomRightPosition,
      bottomLeftPosition,
    ] = this.getCornerPositions();
    return {
      topLeftPosition,
      topMiddlePosition: Vec2.centre(topLeftPosition, topRightPosition),
      topRightPosition,
      rightMiddlePosition: Vec2.centre(topRightPosition, bottomRightPosition),
      bottomRightPosition,
      bottomMiddlePosition: Vec2.centre(
        bottomLeftPosition,
        bottomRightPosition,
      ),
      bottomLeftPosition,
      leftMiddlePosition: Vec2.centre(topLeftPosition, bottomLeftPosition),
    };
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

  resize(topLeftPosition: Vec2, bottomRightPosition: Vec2) {
    this._center = Vec2.centre(topLeftPosition, bottomRightPosition);
    const halfSize = Vec2.diff(bottomRightPosition, topLeftPosition).scaled(
      0.5,
    );
    this.halfSize = new Vec2(Math.abs(halfSize.x), Math.abs(halfSize.y));
  }

  rescaleSize(scale: number): void {
    this.halfSize = this.halfSize.scaled(scale);
  }

  center(): Vec2 {
    return this._center;
  }

  toKetNode(): KetFileNode<KetFileNodeContent> {
    return {
      type: RASTER_IMAGE_SERIALIZE_KEY,
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
