import {
  CheckData,
  AutomapData,
  CalculateCipData,
  DearomatizeData,
  AromatizeData,
  CleanData,
  LayoutData,
  CalculateData
} from './structService.types'
/****************************************************************************
 * Copyright 2020 EPAM Systems
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
import indigoModuleFn from './../../../generated/libindigo'
import {
  StructService,
  ChemicalMimeType,
  SupportedFormat,
  Options,
  InfoResult,
  ConvertData,
  ConvertResult,
  LayoutResult,
  CleanResult,
  AromatizeResult,
  DearomatizeResult,
  CalculateCipResult,
  AutomapResult,
  CheckResult,
  CalculateResult,
  RecognizeResult
} from './structService.types'

interface IndigoOptions {
  set: (key: string, value: string) => void
}

function setOptions(indigoOptions: IndigoOptions, options: Options) {
  for (let [key, value] of Object.entries(options)) {
    indigoOptions.set(key, (value as any).toString())
  }
}

function convertMimeTypeToOutputFormat(
  mimeType: ChemicalMimeType
): SupportedFormat | undefined {
  let format: SupportedFormat | undefined
  switch (mimeType) {
    case ChemicalMimeType.Mol: {
      format = SupportedFormat.Mol
      break
    }
    case ChemicalMimeType.Rxn: {
      format = SupportedFormat.Rxn
      break
    }
    case ChemicalMimeType.DaylightSmiles:
    case ChemicalMimeType.ExtendedSmiles: {
      format = SupportedFormat.Smiles
      break
    }
    case ChemicalMimeType.DaylightSmarts: {
      format = SupportedFormat.Smiles
      break
    }
    case ChemicalMimeType.InchI: {
      format = SupportedFormat.InchI
      break
    }
    case ChemicalMimeType.InChIAuxInfo: {
      format = SupportedFormat.InChIAuxInfo
      break
    }
    case ChemicalMimeType.CML: {
      format = SupportedFormat.CML
      break
    }
  }

  return format
}

class IndigoService implements StructService {
  private defaultOptions: any
  private indigoModule: any

  constructor(defaultOptions: Options) {
    this.defaultOptions = defaultOptions
    this.indigoModule = indigoModuleFn()
  }

  async info(): Promise<InfoResult> {
    return this.indigoModule.then(indigo => {
      const result: InfoResult = {
        indigoVersion: indigo.version(),
        imagoVersions: [],
        isAvailable: true
      }

      return result
    })
  }

  convert(data: ConvertData, options: Options): Promise<ConvertResult> {
    const { output_format, struct } = data
    const format = convertMimeTypeToOutputFormat(output_format)
    return this.indigoModule.then(indigo => {
      const indigoOptions = new indigo.map$string$$string$()
      setOptions(indigoOptions, Object.assign({}, this.defaultOptions, options))
      const convertedStruct = indigo.convert(struct, format, indigoOptions)
      const result: ConvertResult = {
        struct: convertedStruct,
        format: output_format
      }
      return result
    })
  }

  layout(data: LayoutData, options: Options): Promise<LayoutResult> {
    const { struct } = data
    return this.indigoModule.then(indigo => {
      const indigoOptions = new indigo.map$string$$string$()
      setOptions(indigoOptions, Object.assign({}, this.defaultOptions, options))
      const updatedStruct = indigo.layout(struct, indigoOptions)
      const result: LayoutResult = {
        struct: updatedStruct,
        format: ChemicalMimeType.Mol
      }
      return result
    })
  }

  clean(data: CleanData, options: Options): Promise<CleanResult> {
    //TODO: very slow
    const { struct } = data
    return this.indigoModule.then(indigo => {
      const indigoOptions = new indigo.map$string$$string$()
      setOptions(indigoOptions, Object.assign({}, this.defaultOptions, options))
      const updatedStruct = indigo.clean2d(struct, indigoOptions)
      const result: CleanResult = {
        struct: updatedStruct,
        format: ChemicalMimeType.Mol
      }
      return result
    })
  }

  aromatize(data: AromatizeData, options: Options): Promise<AromatizeResult> {
    const { struct } = data
    return this.indigoModule.then(indigo => {
      const indigoOptions = new indigo.map$string$$string$()
      setOptions(indigoOptions, Object.assign({}, this.defaultOptions, options))
      const aromatizedStruct = indigo.aromatize(struct, indigoOptions)
      const result: AromatizeResult = {
        struct: aromatizedStruct,
        format: ChemicalMimeType.Mol
      }
      return result
    })
  }

  dearomatize(
    data: DearomatizeData,
    options: Options
  ): Promise<DearomatizeResult> {
    const { struct } = data
    return this.indigoModule.then(indigo => {
      const indigoOptions = new indigo.map$string$$string$()
      setOptions(indigoOptions, Object.assign({}, this.defaultOptions, options))
      const dearomatizedStruct = indigo.dearomatize(struct, indigoOptions)
      const result: AromatizeResult = {
        struct: dearomatizedStruct,
        format: ChemicalMimeType.Mol
      }
      return result
    })
  }

  calculateCip(
    data: CalculateCipData,
    options: Options
  ): Promise<CalculateCipResult> {
    const { struct } = data
    return this.indigoModule.then(indigo => {
      const indigoOptions = new indigo.map$string$$string$()
      setOptions(indigoOptions, Object.assign({}, this.defaultOptions, options))
      const updatedStruct = indigo.calculateCip(struct, indigoOptions)
      const result: CalculateCipResult = {
        struct: updatedStruct,
        format: ChemicalMimeType.Mol
      }
      return result
    })
  }

  automap(data: AutomapData, options: Options): Promise<AutomapResult> {
    const { mode, struct } = data
    return this.indigoModule.then(indigo => {
      const indigoOptions = new indigo.map$string$$string$()
      setOptions(indigoOptions, Object.assign({}, this.defaultOptions, options))
      const updatedStruct = indigo.automap(struct, mode, indigoOptions)
      const result: AutomapResult = {
        struct: updatedStruct,
        format: ChemicalMimeType.Mol
      }
      return result
    })
  }

  check(data: CheckData, options: Options): Promise<CheckResult> {
    //TODO: transform to valid result
    const { types, struct } = data
    return this.indigoModule.then(indigo => {
      const indigoOptions = new indigo.map$string$$string$()
      setOptions(indigoOptions, Object.assign({}, this.defaultOptions, options))
      const warnings = indigo.check(
        struct,
        types?.length ? types.join(';') : '',
        indigoOptions
      )
      const result: CheckResult = warnings as CheckResult
      return result
    })
  }

  calculate(data: CalculateData, options: Options): Promise<CalculateResult> {
    const { struct } = data
    return this.indigoModule.then(indigo => {
      const indigoOptions = new indigo.map$string$$string$()
      setOptions(indigoOptions, Object.assign({}, this.defaultOptions, options))
      const calculatedPropertiesString = indigo.calculate(struct, indigoOptions)
      //TODO: map to required fileds
      const result: CalculateResult = JSON.parse(
        calculatedPropertiesString
      ) as CalculateResult
      return result
    })
  }

  //@ts-ignore
  recognize(blob: Blob, version: string): Promise<RecognizeResult> {
    return Promise.reject('not implemented yet')
  }
}

export default IndigoService
