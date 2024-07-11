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
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { BaseOperation } from 'application/editor/operations/base';
import { OperationType } from 'application/editor';
import { RasterImage } from 'domain/entities/rasterImage';
import { ReStruct } from 'application/render';
import { ReRasterImage } from 'application/render/restruct/rerasterImage';

export class RasterImageUpsert extends BaseOperation {
  constructor(private readonly rasterImage: RasterImage, private id?: number) {
    super(OperationType.RASTER_IMAGE_UPSERT);
  }

  execute(reStruct: ReStruct) {
    const struct = reStruct.molecule;

    if (!this.id) {
      this.id = struct.rasterImages.newId();
    }
    const id = this.id;
    const item = this.rasterImage.clone();
    struct.rasterImages.set(id, item);
    reStruct.rasterImages.set(id, new ReRasterImage(item));

    BaseOperation.invalidateItem(reStruct, 'rasterImages', id, 1);
  }

  invert(): BaseOperation {
    return new RasterImageDelete(this.id!);
  }
}

export class RasterImageDelete extends BaseOperation {
  private rasterImage?: RasterImage;
  constructor(private id: number) {
    super(OperationType.RASTER_IMAGE_DELETE);
  }

  execute(reStruct: ReStruct) {
    const reRasterImage = reStruct.rasterImages.get(this.id);

    if (!reRasterImage) {
      return;
    }

    reStruct.clearVisel(reRasterImage.visel);
    reRasterImage.remove();
    reStruct.markItemRemoved();
    reStruct.rasterImages.delete(this.id);
    reStruct.molecule.rasterImages.delete(this.id);
  }

  invert(): BaseOperation {
    return new RasterImageUpsert(this.rasterImage!, this.id);
  }
}
