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
  AutomapMode,
  CalculateProps,
  CalculateResult,
  CheckResult,
  CheckTypes,
  ChemicalMimeType,
  ConvertResult,
  InfoResult,
  OutputFormatType,
  StructService,
} from 'domain/services';
import { StructOrString } from 'application/indigo.types';
import { KetSerializer } from 'domain/serializers';
import { Struct } from 'domain/entities';

const defaultTypes: Array<CheckTypes> = [
  'radicals',
  'pseudoatoms',
  'stereo',
  'query',
  'overlapping_atoms',
  'overlapping_bonds',
  'rgroups',
  'chiral',
  '3d',
];
const defaultCalcProps: Array<CalculateProps> = [
  'molecular-weight',
  'most-abundant-mass',
  'monoisotopic-mass',
  'gross',
  'mass-composition',
];

type ConvertOptions = {
  outputFormat?: ChemicalMimeType;
};
type AutomapOptions = {
  mode?: AutomapMode;
};
type CheckOptions = {
  types?: Array<CheckTypes>;
};
type CalculateOptions = {
  properties?: Array<CalculateProps>;
};
type RecognizeOptions = {
  version?: string;
};
type GenerateImageOptions = {
  outputFormat?: OutputFormatType;
  backgroundColor?: string;
};

function convertStructToString(
  struct: StructOrString,
  serializer: KetSerializer,
): string {
  if (typeof struct !== 'string') {
    const aidMap = new Map();
    const result = struct.clone(null, null, false, aidMap);

    return serializer.serialize(result);
  }

  return struct;
}

export class Indigo {
  #structService: StructService;
  #ketSerializer: KetSerializer;

  constructor(structService) {
    this.#structService = structService;
    this.#ketSerializer = new KetSerializer();
  }

  info(): Promise<InfoResult> {
    return this.#structService.info();
  }

  convert(
    struct: StructOrString,
    options?: ConvertOptions,
  ): Promise<ConvertResult> {
    const outputFormat = options?.outputFormat || ChemicalMimeType.KET;

    return this.#structService.convert({
      struct: convertStructToString(struct, this.#ketSerializer),
      output_format: outputFormat,
    });
  }

  layout(struct: StructOrString): Promise<Struct> {
    return this.#structService
      .layout({
        struct: convertStructToString(struct, this.#ketSerializer),
        output_format: ChemicalMimeType.KET,
      })
      .then((data) => this.#ketSerializer.deserialize(data.struct));
  }

  clean(struct: StructOrString): Promise<Struct> {
    return this.#structService
      .clean({
        struct: convertStructToString(struct, this.#ketSerializer),
        output_format: ChemicalMimeType.KET,
      })
      .then((data) => this.#ketSerializer.deserialize(data.struct));
  }

  aromatize(struct: StructOrString): Promise<Struct> {
    return this.#structService
      .aromatize({
        struct: convertStructToString(struct, this.#ketSerializer),
        output_format: ChemicalMimeType.KET,
      })
      .then((data) => this.#ketSerializer.deserialize(data.struct));
  }

  dearomatize(struct: StructOrString): Promise<Struct> {
    return this.#structService
      .dearomatize({
        struct: convertStructToString(struct, this.#ketSerializer),
        output_format: ChemicalMimeType.KET,
      })
      .then((data) => this.#ketSerializer.deserialize(data.struct));
  }

  calculateCip(struct: StructOrString): Promise<Struct> {
    return this.#structService
      .calculateCip({
        struct: convertStructToString(struct, this.#ketSerializer),
        output_format: ChemicalMimeType.KET,
      })
      .then((data) => this.#ketSerializer.deserialize(data.struct));
  }

  automap(struct: StructOrString, options?: AutomapOptions): Promise<Struct> {
    const mode = options?.mode || 'discard';

    return this.#structService
      .automap({
        struct: convertStructToString(struct, this.#ketSerializer),
        output_format: ChemicalMimeType.KET,
        mode,
      })
      .then((data) => this.#ketSerializer.deserialize(data.struct));
  }

  check(struct: StructOrString, options?: CheckOptions): Promise<CheckResult> {
    const types = options?.types || defaultTypes;

    return this.#structService.check({
      struct: convertStructToString(struct, this.#ketSerializer),
      types,
    });
  }

  calculate(
    struct: StructOrString,
    options?: CalculateOptions,
  ): Promise<CalculateResult> {
    const properties = options?.properties || defaultCalcProps;

    return this.#structService.calculate({
      struct: convertStructToString(struct, this.#ketSerializer),
      properties,
    });
  }

  recognize(image: Blob, options?: RecognizeOptions): Promise<Struct> {
    const version = options?.version || '';

    return this.#structService
      .recognize(image, version)
      .then((data) => this.#ketSerializer.deserialize(data.struct));
  }

  generateImageAsBase64(
    struct: StructOrString,
    options?: GenerateImageOptions,
  ): Promise<string> {
    const outputFormat = options?.outputFormat || 'png';
    const backgroundColor = options?.backgroundColor || '';

    return this.#structService.generateImageAsBase64(
      convertStructToString(struct, this.#ketSerializer),
      {
        outputFormat,
        backgroundColor,
      },
    );
  }
}
