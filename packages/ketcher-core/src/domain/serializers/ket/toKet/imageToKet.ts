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

import { IMAGE_SERIALIZE_KEY } from 'domain/constants';
import { KetFileNode } from 'domain/serializers';
import { KetFileImageNode } from 'domain/entities';

export function imageToKet(imageNode: KetFileNode) {
  return {
    type: IMAGE_SERIALIZE_KEY,
    format: (imageNode as KetFileImageNode).format,
    boundingBox: (imageNode as KetFileImageNode).boundingBox,
    data: imageNode.data,
    selected: imageNode.selected,
  };
}
