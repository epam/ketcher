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
  FormatterFactoryOptions,
  StructFormatter,
  SupportedFormat
} from './structFormatter.types'
import {
  KetSerializer,
  MolSerializer,
  MolSerializerOptions,
  SmiSerializer
} from 'domain/serializers'
import { StructService, StructServiceOptions } from 'domain/services'

import { GraphFormatter } from './graphFormatter'
import { MolfileV2000Formatter } from './molfileV2000Formatter'
import { RxnFormatter } from './rxnFormatter'
import { ServerFormatter } from './serverFormatter'
import { SmilesFormatter } from './smilesFormatter'

export class FormatterFactory {
  constructor(private readonly structService: StructService) {}

  private separateOptions(
    options?: FormatterFactoryOptions
  ): [Partial<MolSerializerOptions>, StructServiceOptions | {}] {
    if (!options) {
      return [{}, {}]
    }

    const { reactionRelayout, badHeaderRecover, ...structServiceOptions } =
      options

    let molfileParseOptions: Partial<MolSerializerOptions> = {}

    if (typeof reactionRelayout === 'boolean') {
      molfileParseOptions.reactionRelayout = reactionRelayout
    }
    if (typeof badHeaderRecover === 'boolean') {
      molfileParseOptions.badHeaderRecover = badHeaderRecover
    }

    return [molfileParseOptions, structServiceOptions]
  }

  create(
    format: SupportedFormat,
    options?: FormatterFactoryOptions
  ): StructFormatter {
    const [molSerializerOptions, structServiceOptions] =
      this.separateOptions(options)

    let formatter: StructFormatter
    switch (format) {
      case 'graph':
        formatter = new GraphFormatter(new KetSerializer())
        break

      case 'mol':
        formatter = new MolfileV2000Formatter(
          new MolSerializer(molSerializerOptions)
        )
        break

      case 'rxn':
        formatter = new RxnFormatter(new MolSerializer(molSerializerOptions))
        break

      case 'smiles':
        formatter = new SmilesFormatter(
          new SmiSerializer(),

          // only for ServerFormatter, because 'getStructureFromStringAsync' is delegated to it

          this.structService,
          new MolSerializer(molSerializerOptions),
          format,
          structServiceOptions
        )
        break

      case 'cml':
      case 'inChIAuxInfo':
      case 'inChI':
      case 'molV3000':
      case 'rxnV3000':
      case 'smilesExt':
      case 'smarts':
      default:
        formatter = new ServerFormatter(
          this.structService,
          new MolSerializer(molSerializerOptions),
          format,
          structServiceOptions
        )
    }

    return formatter
  }
}
