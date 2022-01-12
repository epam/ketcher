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
  FormatterFactory,
  identifyStructFormat,
  SupportedFormat
} from './formatters'
import {
  AromatizeResult,
  AutomapMode,
  AutomapResult,
  CalculateCipResult,
  CalculateProps,
  CalculateResult,
  CheckResult,
  CheckTypes,
  ChemicalMimeType,
  CleanResult,
  ConvertResult,
  DearomatizeResult,
  GenerateImageOptions,
  InfoResult,
  LayoutResult,
  OutputFormatType,
  RecognizeResult,
  Selected,
  StructOrString,
  StructService
} from 'domain/services'

import { Editor } from './editor'
import { MolfileFormat } from 'domain/serializers'
import { Struct } from 'domain/entities'
import assert from 'assert'

interface IndigoService {
  info: () => Promise<InfoResult>
  calculate: (
    struct: StructOrString,
    properties?: CalculateProps,
    selected?: Selected
  ) => Promise<CalculateResult>
  convert: (
    struct: StructOrString,
    outputFormat?: ChemicalMimeType
  ) => Promise<ConvertResult>
  layout: (struct: StructOrString) => Promise<LayoutResult>
  clean: (struct: StructOrString, selected?: Selected) => Promise<CleanResult>
  aromatize: (struct: StructOrString) => Promise<AromatizeResult>
  dearomatize: (struct: StructOrString) => Promise<DearomatizeResult>
  calculateCip: (struct: StructOrString) => Promise<CalculateCipResult>
  automap: (struct: StructOrString, mode: AutomapMode) => Promise<AutomapResult>
  check: (struct: StructOrString, types?: CheckTypes) => Promise<CheckResult>
  recognize: (blob: Blob, version: string) => Promise<RecognizeResult>
  generateImageAsBase64: (
    data: string,
    outputFormat?: OutputFormatType,
    backgroundColor?: string
  ) => Promise<string>
}

function parseStruct(structStr: string, structService: StructService) {
  const format = identifyStructFormat(structStr)
  const factory = new FormatterFactory(structService)

  const service = factory.create(format)
  return service.getStructureFromStringAsync(structStr)
}

function getStructure(
  structureFormat: SupportedFormat = 'rxn',
  formatterFactory: FormatterFactory,
  struct: Struct
): Promise<string> {
  const formatter = formatterFactory.create(structureFormat)
  return formatter.getStructureFromStructAsync(struct)
}

export class Ketcher {
  #structService: StructService
  #formatterFactory: FormatterFactory
  #editor: Editor

  get editor(): Editor {
    return this.#editor
  }

  constructor(
    editor: Editor,
    structService: StructService,
    formatterFactory: FormatterFactory
  ) {
    assert(editor != null)
    assert(structService != null)
    assert(formatterFactory != null)

    this.#editor = editor
    this.#structService = structService
    this.#formatterFactory = formatterFactory
  }

  get server(): IndigoService {
    const service = this.#structService
    const defaultTypes: CheckTypes = [
      'radicals',
      'pseudoatoms',
      'stereo',
      'query',
      'overlapping_atoms',
      'overlapping_bonds',
      'rgroups',
      'chiral',
      '3d'
    ]
    const defaultCalcProps: CalculateProps = [
      'molecular-weight',
      'most-abundant-mass',
      'monoisotopic-mass',
      'gross',
      'mass-composition'
    ]

    return {
      info: () => service.info(),
      convert: (struct, outputFormat = ChemicalMimeType.KET) =>
        service.convert({ struct, output_format: outputFormat }),
      layout: (struct) =>
        service.layout({ struct, output_format: ChemicalMimeType.KET }),
      clean: (struct, selected) =>
        service.clean({
          struct,
          output_format: ChemicalMimeType.KET,
          selected
        }),
      aromatize: (struct) =>
        service.aromatize({ struct, output_format: ChemicalMimeType.KET }),
      dearomatize: (struct) =>
        service.dearomatize({ struct, output_format: ChemicalMimeType.KET }),
      calculateCip: (struct) =>
        service.calculateCip({ struct, output_format: ChemicalMimeType.KET }),
      automap: (struct, mode) =>
        service.automap({ struct, output_format: ChemicalMimeType.KET, mode }),
      check: (struct, types = defaultTypes) => service.check({ struct, types }),
      calculate: (struct, properties = defaultCalcProps, selected) =>
        service.calculate({
          properties,
          struct,
          selected
        }),
      recognize: (blob, version) => service.recognize(blob, version),
      generateImageAsBase64: (data, outputFormat = 'png', backgroundColor) =>
        service.generateImageAsBase64(data, { outputFormat, backgroundColor })
    }
  }

  getSmiles(isExtended = false): Promise<string> {
    const format: SupportedFormat = isExtended ? 'smilesExt' : 'smiles'
    return getStructure(format, this.#formatterFactory, this.editor.struct())
  }

  async getMolfile(molfileFormat: MolfileFormat = 'v2000'): Promise<string> {
    if (this.containsReaction()) {
      throw Error(
        'The structure cannot be saved as *.MOL due to reaction arrrows.'
      )
    }

    const format: SupportedFormat =
      molfileFormat === 'v3000' ? 'molV3000' : 'mol'
    const molfile = await getStructure(
      format,
      this.#formatterFactory,
      this.#editor.struct()
    )

    return molfile
  }

  async getRxn(molfileFormat: MolfileFormat = 'v2000'): Promise<string> {
    if (!this.containsReaction()) {
      throw Error(
        'The structure cannot be saved as *.RXN: there is no reaction arrows.'
      )
    }
    const format: SupportedFormat =
      molfileFormat === 'v3000' ? 'rxnV3000' : 'rxn'
    const rxnfile = await getStructure(
      format,
      this.#formatterFactory,
      this.#editor.struct()
    )

    return rxnfile
  }

  getKet(): Promise<string> {
    return getStructure('ket', this.#formatterFactory, this.#editor.struct())
  }

  getSmarts(): Promise<string> {
    return getStructure('smarts', this.#formatterFactory, this.#editor.struct())
  }

  getCml(): Promise<string> {
    return getStructure('cml', this.#formatterFactory, this.#editor.struct())
  }

  getInchi(withAuxInfo = false): Promise<string> {
    return getStructure(
      withAuxInfo ? 'inChIAuxInfo' : 'inChI',
      this.#formatterFactory,
      this.#editor.struct()
    )
  }

  containsReaction(): boolean {
    return this.editor.struct().hasRxnArrow()
  }

  async setMolecule(structStr: string): Promise<void> {
    assert(typeof structStr === 'string')

    const struct: Struct = await parseStruct(structStr, this.#structService)
    this.#editor.struct(struct)
  }

  async addFragment(fragment: string): Promise<void> {
    assert(typeof fragment === 'string')

    throw Error('not implemented yet')
  }

  async generateImage(
    data: string,
    options: GenerateImageOptions = { outputFormat: 'png' }
  ): Promise<Blob> {
    let meta = ''

    switch (options.outputFormat) {
      case 'svg':
        meta = 'image/svg+xml'
        break

      case 'png':
      default:
        meta = 'image/png'
        options.outputFormat = 'png'
    }

    const base64 = await this.#structService.generateImageAsBase64(
      data,
      options
    )
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: meta })
    return blob
  }
}
