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
import { Image } from 'domain/entities/image';
import { ReStruct } from 'application/render';
import { ReImage } from 'application/render/restruct/reImage';
import { IMAGE_KEY } from 'domain/constants';

export class ImageUpsert extends BaseOperation {
  constructor(private readonly image: Image, private id?: number) {
    super(OperationType.IMAGE_UPSERT);
  }

  execute(reStruct: ReStruct) {
    const struct = reStruct.molecule;

    if (this.id === undefined) {
      this.id = struct.images.newId();
    }
    const id = this.id;
    const item = this.image.clone();
    struct.images.set(id, item);
    reStruct.images.set(id, new ReImage(item));

    BaseOperation.invalidateItem(reStruct, IMAGE_KEY, id, 1);
  }

  invert(): BaseOperation {
    return new ImageDelete(this.id!);
  }
}

export class ImageDelete extends BaseOperation {
  private image?: Image;
  constructor(private id: number) {
    super(OperationType.IMAGE_DELETE);
  }

  execute(reStruct: ReStruct) {
    const reImage = reStruct.images.get(this.id);

    if (!reImage) {
      return;
    }

    this.image = reImage.image.clone();
    reStruct.clearVisel(reImage.visel);
    reStruct.markItemRemoved();
    reStruct.images.delete(this.id);
    reStruct.molecule.images.delete(this.id);
  }

  invert(): BaseOperation {
    return new ImageUpsert(this.image!, this.id);
  }
}
