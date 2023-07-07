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

import { SdfItem, StructAssociatedData } from './sdf.types';

import { MolSerializer } from '../mol/molSerializer';
import { Serializer } from '../serializers.types';

const DelimeterRegex = /^[^]+?\$\$\$\$$/gm;
export class SdfSerializer implements Serializer<Array<SdfItem>> {
  deserialize(content: string): Array<SdfItem> {
    let m: any;
    const result: Array<SdfItem> = [];
    const molSerializer = new MolSerializer();
    while ((m = DelimeterRegex.exec(content)) !== null) {
      const chunk = m[0].replace(/\r/g, '').trim(); // TODO: normalize newline?
      const end = chunk.indexOf('M  END');
      if (end !== -1) {
        const propChunks: any = chunk
          .substr(end + 7)
          .trim()
          .split(/^$\n?/m);

        const struct = molSerializer.deserialize(chunk.substring(0, end + 6));
        const props = propChunks.reduce(
          (acc: StructAssociatedData, pc: string) => {
            const m = pc.match(/^> [ \d]*<(\S+)>/);
            if (m) {
              const field = m[1];
              const value = pc.split('\n')[1].trim();
              acc[field] = Number.isFinite(value) ? +value : value.toString(); // eslint-disable-line
            }
            return acc;
          },
          {} as StructAssociatedData,
        );

        result.push({ struct, props });
      }
    }
    return result;
  }

  serialize(sdfItems: Array<SdfItem>): string {
    const molSerializer = new MolSerializer();
    return sdfItems.reduce((res, item) => {
      res += molSerializer.serialize(item.struct);

      Object.keys(item.props).forEach((prop) => {
        res += `> <${prop}>\n`;
        res += `${item.props[prop]}\n\n`;
      });

      return `${res}$$$$\n`;
    }, '');
  }
}
