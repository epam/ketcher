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
  ConvertData,
  ConvertResult,
  LayoutData,
  LayoutResult,
  StructService,
  StructServiceOptions,
} from 'domain/services';
import { StructFormatter, SupportedFormat } from './structFormatter.types';

import { KetSerializer } from 'domain/serializers';
import { Struct } from 'domain/entities';
import { getPropertiesByFormat } from './formatProperties';
import { KetcherLogger } from 'utilities';
import { SmilesFormatter } from './smilesFormatter';

type ConvertPromise = (
  data: ConvertData,
  options?: StructServiceOptions,
) => Promise<ConvertResult>;

type LayoutPromise = (
  data: LayoutData,
  options?: StructServiceOptions,
) => Promise<LayoutResult>;

export class ServerFormatter implements StructFormatter {
  #structService: StructService;
  #ketSerializer: KetSerializer;
  #format: SupportedFormat;
  #options?: StructServiceOptions;

  constructor(
    structService: StructService,
    ketSerializer: KetSerializer,
    format: SupportedFormat,
    options?: StructServiceOptions,
  ) {
    this.#structService = structService;
    this.#ketSerializer = ketSerializer;
    this.#format = format;
    this.#options = options;
  }

  async getStructureFromStructAsync(struct: Struct): Promise<string> {
    const formatProperties = getPropertiesByFormat(this.#format);

    try {
      const stringifiedStruct = this.#ketSerializer.serialize(struct);
      const convertResult = await this.#structService.convert(
        {
          struct: stringifiedStruct,
          output_format: formatProperties.mime,
        },
        { ...this.#options, ...formatProperties.options },
      );

      return convertResult.struct;
    } catch (e: any) {
      let message;
      if (e.message === 'Server is not compatible') {
        message = `${formatProperties.name} is not supported.`;
      } else {
        message = `Convert error!\n${e.message || e}`;
      }
      KetcherLogger.error('serverFormatter.ts::getStructureFromStructAsync', e);
      throw new Error(message);
    }
  }

  getCallingMethod(
    stringifiedStruct: string,
    format: SupportedFormat,
  ): {
    method: LayoutPromise | ConvertPromise;
    struct: string;
  } {
    if (this.#format === SupportedFormat.smiles) {
      return {
        method: SmilesFormatter.isContainsCoordinates(stringifiedStruct)
          ? this.#structService.convert
          : this.#structService.layout,
        struct: stringifiedStruct,
      };
    }
    const withCoords = getPropertiesByFormat(format).supportsCoords;
    if (withCoords) {
      return {
        method: this.#structService.convert,
        struct: stringifiedStruct,
      };
    }
    return {
      method: this.#structService.layout,
      struct: stringifiedStruct.trim(),
    };
  }

  async getStructureFromStringAsync(
    stringifiedStruct: string,
  ): Promise<Struct> {
    const data: ConvertData | LayoutData = {
      struct: undefined as any,
      output_format: getPropertiesByFormat(SupportedFormat.ket).mime,
    };

    const { method, struct } = this.getCallingMethod(
      stringifiedStruct,
      this.#format,
    );
    data.struct = struct;

    try {
      const result = await method(data, this.#options);
      const parsedStruct = this.#ketSerializer.deserialize(result.struct);
      if (method === this.#structService.layout) {
        parsedStruct.rescale();
      }
      return parsedStruct;
    } catch (e: any) {
      if (e.message !== 'Server is not compatible') {
        KetcherLogger.error(
          'serverFormatter.ts::getStructureFromStringAsync',
          e,
        );
        throw Error(`Convert error!\n${e.message || e}`);
      }

      const formatError =
        this.#format === 'smiles'
          ? `${
              getPropertiesByFormat(SupportedFormat.smilesExt).name
            } and opening of ${
              getPropertiesByFormat(SupportedFormat.smiles).name
            }`
          : getPropertiesByFormat(this.#format).name;

      throw Error(`${formatError} is not supported in standalone mode.`);
    }
  }
}
