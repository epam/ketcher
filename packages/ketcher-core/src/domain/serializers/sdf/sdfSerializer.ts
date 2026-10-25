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

import type { SdfItem, StructAssociatedData } from './sdf.types';

import { MolSerializer } from '../mol/molSerializer';
import type { Serializer } from '../serializers.types';
import type { MolSerializerOptions } from '../mol';

const DelimeterRegex = /^[^]+?\$\$\$\$$/gm;
export class SdfSerializer implements Serializer<Array<SdfItem>> {
  private readonly molSerializerOptions?: Partial<MolSerializerOptions>;

  constructor(options?: Partial<MolSerializerOptions>) {
    this.molSerializerOptions = options;
  }

  deserialize(content: string): Array<SdfItem> {
    const result: Array<SdfItem> = [];
    const molSerializer = new MolSerializer(this.molSerializerOptions);
    let m: RegExpExecArray | null = DelimeterRegex.exec(content);
    while (m !== null) {
      const chunk = m[0].replace(/\r/g, '').trim(); // TODO: normalize newline?
      const end = chunk.indexOf('M  END');
      if (end !== -1) {
        const propertyChunks: string[] = chunk
          .substr(end + 7)
          .trim()
          .split(/^$\n?/m);

        const struct = molSerializer.deserialize(chunk.substring(0, end + 6));
        const properties = propertyChunks.reduce(
          (accumulator: StructAssociatedData, pc: string) => {
            const m = /^> [ \d]*<(\S+)>/.exec(pc);
            if (m) {
              const field = m[1];
              const valueArray = pc.split('\n').slice(1, -1);
              let value: string;
              if (valueArray.length > 1) {
                value = valueArray.join(',');
              } else {
                value = pc.split('\n')[1].trim();
              }

              accumulator[field] = Number.isFinite(value)
                ? +value
                : value.toString();
            }
            return accumulator;
          },
          {} as StructAssociatedData,
        );

        result.push({ struct, props: properties });
      }
      m = DelimeterRegex.exec(content);
    }
    return result;
  }

  serialize(sdfItems: Array<SdfItem>): string {
    const molSerializer = new MolSerializer(this.molSerializerOptions);
    return sdfItems.reduce((result, item) => {
      result += molSerializer.serialize(item.struct);

      Object.keys(item.props).forEach((property) => {
        result += `> <${property}>\n`;
        result += `${item.props[property]}\n\n`;
      });

      return `${result}$$$$\n`;
    }, '');
  }
}
