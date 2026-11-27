/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { BaseMicromoleculeEntity } from 'domain/entities/BaseMicromoleculeEntity';
import { Vec2 } from 'domain/entities/vec2';
import type { KetFileNode } from 'domain/serializers/serializers.types';
import { getNodeWithInvertedYCoord } from 'domain/serializers/ket/helpers';
import { IMAGE_SERIALIZE_KEY } from 'domain/constants';
import { getBoxHandles } from 'domain/staticObjects/geometry';
import { getOrThrow } from 'utilities';
import type { BoxHandle } from 'domain/staticObjects/types';

export interface KetFileImageNode extends KetFileNode<string> {
  format: string;
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

export const IMAGE_REFERENCE_NAME_TO_HANDLE: Record<
  ImageReferenceName,
  BoxHandle
> = {
  topLeftPosition: 'topLeft',
  topMiddlePosition: 'top',
  topRightPosition: 'topRight',
  rightMiddlePosition: 'right',
  bottomRightPosition: 'bottomRight',
  bottomMiddlePosition: 'bottom',
  bottomLeftPosition: 'bottomLeft',
  leftMiddlePosition: 'left',
};

export interface ImageReferencePositionInfo {
  name: ImageReferenceName;
  offset: Vec2;
}

export class Image extends BaseMicromoleculeEntity {
  static fromKetNode(ketFileNode: KetFileImageNode): Image {
    const { width, height, ...point } = getNodeWithInvertedYCoord(
      ketFileNode.boundingBox,
    );
    const halfSize = new Vec2(width / 2, height / 2);
    const topLeftCorner = new Vec2(point);
    const center = topLeftCorner.add(halfSize);
    const imageSrc = `data:${ketFileNode.format};base64,${ketFileNode.data}`;

    // Should be validated already
    const image = new Image(imageSrc, center, halfSize);
    image.setInitiallySelected(ketFileNode.selected);
    return image;
  }

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
    const handles = getBoxHandles({
      min: this.getTopLeftPosition(),
      max: this.getBottomRightPosition(),
    });
    const positionOf = (name: ImageReferenceName) =>
      getOrThrow(
        handles,
        IMAGE_REFERENCE_NAME_TO_HANDLE[name],
        `Image handle ${name} not found`,
      );

    return {
      topLeftPosition: positionOf('topLeftPosition'),
      topMiddlePosition: positionOf('topMiddlePosition'),
      topRightPosition: positionOf('topRightPosition'),
      rightMiddlePosition: positionOf('rightMiddlePosition'),
      bottomRightPosition: positionOf('bottomRightPosition'),
      bottomMiddlePosition: positionOf('bottomMiddlePosition'),
      bottomLeftPosition: positionOf('bottomLeftPosition'),
      leftMiddlePosition: positionOf('leftMiddlePosition'),
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

  rescale(scale: number): void {
    this._center = this._center.scaled(scale);
    this.rescaleSize(scale);
  }

  center(): Vec2 {
    return this._center;
  }

  toKetNode(): KetFileImageNode {
    const topLeftCorner = this.getTopLeftPosition();
    const base64Data = this.bitmap.replace(/^.*;base64,/, '');
    const format = /^data:(image\/.*);base64,/.exec(this.bitmap)?.[1] as string;
    return {
      type: IMAGE_SERIALIZE_KEY,
      center: getNodeWithInvertedYCoord(this._center),
      format,
      boundingBox: {
        ...getNodeWithInvertedYCoord(topLeftCorner),
        width: this.halfSize.x * 2,
        height: this.halfSize.y * 2,
      },
      data: base64Data,
      selected: this.getInitiallySelected(),
    };
  }
}
