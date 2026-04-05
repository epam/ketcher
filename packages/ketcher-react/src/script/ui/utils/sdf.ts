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

import {
  KetcherLogger,
  MolSerializer,
  MolSerializerOptions,
  Struct,
} from 'ketcher-core';
import { IndigoProvider } from '../../providers';
import { parseStruct } from '../state/shared';

type SdfFieldValue = string | number;
type SdfProps = Record<string, SdfFieldValue | undefined>;

export interface SdfItem {
  struct: Struct;
  props: SdfProps;
}

const DelimeterRegex = /^[^]+?\$\$\$\$$/gm;
const EndMarker = 'M  END';

function toFieldValue(value: string): SdfFieldValue {
  const trimmedValue = value.trim();
  const numericValue = Number(trimmedValue);

  return trimmedValue !== '' &&
    Number.isFinite(numericValue) &&
    String(numericValue) === trimmedValue
    ? numericValue
    : trimmedValue;
}

function parseSdfProps(content: string): SdfProps {
  if (!content) {
    return {};
  }

  return content
    .trim()
    .split(/^$\n?/m)
    .reduce((acc: SdfProps, propChunk: string) => {
      const match = /^> [ \d]*<(\S+)>/.exec(propChunk);
      if (!match) {
        return acc;
      }

      const field = match[1];
      const valueLines = propChunk.split('\n').slice(1, -1);
      const value =
        valueLines.length > 1
          ? valueLines.join(',')
          : (valueLines[0] ?? '').trim();

      acc[field] = toFieldValue(value);
      return acc;
    }, {});
}

export async function deserializeSdf(content: string): Promise<SdfItem[]> {
  const structService = IndigoProvider.getIndigo();
  const chunks: string[] = [];

  let match: RegExpExecArray | null = DelimeterRegex.exec(content);
  while (match) {
    const chunk = match[0].replace(/\r/g, '').trim();
    if (chunk) {
      chunks.push(chunk);
    }
    match = DelimeterRegex.exec(content);
  }

  const items = await Promise.all(
    chunks.map(async (chunk) => {
      const end = chunk.indexOf(EndMarker);
      if (end === -1) {
        return null;
      }

      try {
        const struct = await parseStruct(
          chunk.substring(0, end + EndMarker.length),
          structService,
        );

        return {
          struct,
          props: parseSdfProps(chunk.substring(end + EndMarker.length).trim()),
        };
      } catch (error) {
        KetcherLogger.error('sdf.ts::deserializeSdf', error);
        return null;
      }
    }),
  );

  return items.filter((item): item is SdfItem => item !== null);
}

export function serializeSdfItems(
  sdfItems: SdfItem[],
  options?: Partial<MolSerializerOptions>,
): string {
  const molSerializer = new MolSerializer(options);

  return sdfItems.reduce((result, item) => {
    let chunk = molSerializer.serialize(item.struct);

    Object.entries(item.props).forEach(([prop, value]) => {
      if (value == null) {
        return;
      }

      chunk += `> <${prop}>\n`;
      chunk += `${value}\n\n`;
    });

    return `${result}${chunk}$$$$\n`;
  }, '');
}
