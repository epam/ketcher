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
import { Vec2 } from 'domain/entities/vec2';
import { getNodeWithInvertedYCoord, KetFileNode } from 'domain/serializers';
import { IMAGE_SERIALIZE_KEY } from 'domain/constants';

export interface KetFileImageNode extends KetFileNode<string> {
  boundingBox: {
    x: number;
    y: number;
    z?: number;
    width: number;
    height: number;
  };
}

export interface ImageReferencePositions {
  topLeftPosition: Vec2;
  topMiddlePosition: Vec2;
  topRightPosition: Vec2;
  rightMiddlePosition: Vec2;
  bottomRightPosition: Vec2;
  bottomMiddlePosition: Vec2;
  bottomLeftPosition: Vec2;
  leftMiddlePosition: Vec2;
}

export type ImageReferenceName = keyof ImageReferencePositions;

export interface ImageReferencePositionInfo {
  name: ImageReferenceName;
  offset: Vec2;
}

export class Image extends BaseMicromoleculeEntity {
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

  getReferencePositions(): ImageReferencePositions {
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

  clone(): Image {
    return new Image(
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

  toKetNode(): KetFileImageNode {
    const topLeftCorner = this.getTopLeftPosition();
    return {
      type: IMAGE_SERIALIZE_KEY,
      center: getNodeWithInvertedYCoord(this._center),
      boundingBox: {
        ...getNodeWithInvertedYCoord(topLeftCorner),
        width: this.halfSize.x * 2,
        height: this.halfSize.y * 2,
      },
      data: this.bitmap,
      selected: this.getInitiallySelected(),
    };
  }

  static fromKetNode(ketFileNode: KetFileImageNode): Image {
    const { width, height, ...point } = getNodeWithInvertedYCoord(
      ketFileNode.boundingBox,
    );
    const halfSize = new Vec2(width / 2, height / 2);
    const topLeftCorner = new Vec2(point);
    const center = topLeftCorner.add(halfSize);

    // Should be validated already
    const image = new Image(ketFileNode.data as string, center, halfSize);
    image.setInitiallySelected(ketFileNode.selected);
    return image;
  }
}
