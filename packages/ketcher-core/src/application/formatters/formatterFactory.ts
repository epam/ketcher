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
  MolSerializerOptions
} from 'domain/serializers'
import { StructService, StructServiceOptions } from 'domain/services'
import { KetFormatter } from './ketFormatter'
import { RxnFormatter } from './rxnFormatter'
import { ServerFormatter } from './serverFormatter'
import { MolfileV2000Formatter } from './molfileV2000Formatter'

export class FormatterFactory {
  #structService: StructService

  constructor(structService: StructService) {
    this.#structService = structService
  }

  private separateOptions(
    options?: FormatterFactoryOptions
  ): [Partial<MolSerializerOptions>, Partial<StructServiceOptions>] {
    if (!options) {
      return [{}, {}]
    }

    const {
      reactionRelayout,
      badHeaderRecover,
      ignoreChiralFlag,
      ...structServiceOptions
    } = options

    const molfileParseOptions: Partial<MolSerializerOptions> = {}

    if (typeof reactionRelayout === 'boolean') {
      molfileParseOptions.reactionRelayout = reactionRelayout
    }
    if (typeof badHeaderRecover === 'boolean') {
      molfileParseOptions.badHeaderRecover = badHeaderRecover
    }

    if (typeof ignoreChiralFlag === 'boolean') {
      molfileParseOptions.ignoreChiralFlag = ignoreChiralFlag
      structServiceOptions['ignore-no-chiral-flag'] = ignoreChiralFlag
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
      case SupportedFormat.ket:
        formatter = new KetFormatter(new KetSerializer())
        break

      case SupportedFormat.rxn:
        formatter = new RxnFormatter(new MolSerializer(molSerializerOptions))
        break

      case SupportedFormat.mol:
        formatter = new MolfileV2000Formatter(
          new MolSerializer(molSerializerOptions)
        )
        break

      case SupportedFormat.cml:
      case SupportedFormat.inChIAuxInfo:
      case SupportedFormat.inChI:
      case SupportedFormat.molV3000:
      case SupportedFormat.smiles:
      case SupportedFormat.rxnV3000:
      case SupportedFormat.smilesExt:
      case SupportedFormat.smarts:
      case SupportedFormat.cdxml:
      case SupportedFormat.cdx:
      case SupportedFormat.binaryCdx:
      case SupportedFormat.unknown:
      default:
        formatter = new ServerFormatter(
          this.#structService,
          new KetSerializer(),
          format,
          structServiceOptions
        )
    }

    return formatter
  }
}
