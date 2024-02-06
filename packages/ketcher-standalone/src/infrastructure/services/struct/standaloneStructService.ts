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
  AromatizeCommandData,
  AutomapCommandData,
  CalculateCipCommandData,
  CalculateCommandData,
  CalculateProps,
  CheckCommandData,
  CleanCommandData,
  Command,
  CommandOptions,
  WorkerEvent,
  ConvertCommandData,
  DearomatizeCommandData,
  GenerateImageCommandData,
  GenerateInchIKeyCommandData,
  InputMessage,
  LayoutCommandData,
  OutputMessage,
  SupportedFormat,
  OutputMessageWrapper,
  ExplicitHydrogensCommandData,
} from './indigoWorker.types';
import {
  AromatizeData,
  AromatizeResult,
  AutomapData,
  AutomapResult,
  CalculateCipData,
  CalculateCipResult,
  CalculateData,
  CalculateResult,
  CheckData,
  CheckResult,
  ChemicalMimeType,
  CleanData,
  CleanResult,
  ConvertData,
  ConvertResult,
  DearomatizeData,
  DearomatizeResult,
  ExplicitHydrogensData,
  ExplicitHydrogensResult,
  GenerateImageOptions,
  InfoResult,
  LayoutData,
  LayoutResult,
  RecognizeResult,
  StructService,
  StructServiceOptions,
} from 'ketcher-core';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import IndigoWorker from 'web-worker:./indigoWorker';
import EventEmitter from 'events';

interface KeyValuePair {
  [key: string]: number | string | boolean | object;
}

function convertMimeTypeToOutputFormat(
  mimeType: ChemicalMimeType,
): SupportedFormat {
  let format: SupportedFormat;
  switch (mimeType) {
    case ChemicalMimeType.Mol: {
      format = SupportedFormat.Mol;
      break;
    }
    case ChemicalMimeType.Rxn: {
      format = SupportedFormat.Rxn;
      break;
    }
    case ChemicalMimeType.DaylightSmiles:
    case ChemicalMimeType.ExtendedSmiles: {
      format = SupportedFormat.Smiles;
      break;
    }
    case ChemicalMimeType.DaylightSmarts: {
      format = SupportedFormat.Smarts;
      break;
    }
    case ChemicalMimeType.InChI: {
      format = SupportedFormat.InChI;
      break;
    }
    case ChemicalMimeType.InChIAuxInfo: {
      format = SupportedFormat.InChIAuxInfo;
      break;
    }
    case ChemicalMimeType.InChIKey: {
      format = SupportedFormat.InChIKey;
      break;
    }
    case ChemicalMimeType.CML: {
      format = SupportedFormat.CML;
      break;
    }
    case ChemicalMimeType.KET: {
      format = SupportedFormat.Ket;
      break;
    }
    case ChemicalMimeType.CDXML: {
      format = SupportedFormat.CDXML;
      break;
    }
    case ChemicalMimeType.CDX: {
      format = SupportedFormat.CDX;
      break;
    }
    case ChemicalMimeType.SDF: {
      format = SupportedFormat.SDF;
      break;
    }
    case ChemicalMimeType.UNKNOWN:
    default: {
      throw new Error('Unsupported chemical mime type');
    }
  }

  return format;
}

function mapCalculatedPropertyName(property: CalculateProps) {
  let mappedProperty: CalculateProps | undefined;
  switch (property) {
    case 'gross-formula': {
      mappedProperty = 'gross';
      break;
    }
    default:
      mappedProperty = property;
      break;
  }

  return mappedProperty;
}

function mapWarningGroup(property: string) {
  let mappedProperty: string | undefined;
  switch (property) {
    case 'OVERLAP_BOND': {
      mappedProperty = 'overlapping_bonds';
      break;
    }
    default:
      mappedProperty = property.toLowerCase();
      break;
  }

  return mappedProperty;
}

const messageTypeToEventMapping: {
  [key in Command]: WorkerEvent;
} = {
  [Command.Info]: WorkerEvent.Info,
  [Command.Convert]: WorkerEvent.Convert,
  [Command.Layout]: WorkerEvent.Layout,
  [Command.Clean]: WorkerEvent.Clean,
  [Command.Aromatize]: WorkerEvent.Aromatize,
  [Command.Dearomatize]: WorkerEvent.Dearomatize,
  [Command.CalculateCip]: WorkerEvent.CalculateCip,
  [Command.Automap]: WorkerEvent.Automap,
  [Command.Check]: WorkerEvent.Check,
  [Command.Calculate]: WorkerEvent.Calculate,
  [Command.GenerateImageAsBase64]: WorkerEvent.GenerateImageAsBase64,
  [Command.GetInChIKey]: WorkerEvent.GetInChIKey,
  [Command.ExplicitHydrogens]: WorkerEvent.ExplicitHydrogens,
};

let worker: IndigoWorker;

class IndigoService implements StructService {
  private readonly defaultOptions: StructServiceOptions;
  private readonly worker: IndigoWorker;
  private readonly EE: EventEmitter = new EventEmitter();

  constructor(defaultOptions: StructServiceOptions) {
    this.defaultOptions = defaultOptions;
    this.worker = worker || new IndigoWorker();
    worker = this.worker;
    this.worker.onmessage = (e: MessageEvent<OutputMessage<string>>) => {
      const message: OutputMessage<string> = e.data;
      if (message.type !== undefined) {
        const event = messageTypeToEventMapping[message.type];
        this.EE.emit(event, { data: message });
      }
    };
  }

  async getInChIKey(struct: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const action = ({ data }: OutputMessageWrapper) => {
        const msg: OutputMessage<string> = data;
        if (!msg.hasError) {
          resolve(msg.payload || '');
        } else {
          reject(msg.error);
        }
      };

      const inputMessage: InputMessage<GenerateInchIKeyCommandData> = {
        type: Command.GetInChIKey,
        data: { struct },
      };

      this.EE.removeListener(WorkerEvent.GetInChIKey, action);
      this.EE.addListener(WorkerEvent.GetInChIKey, action);

      this.worker.postMessage(inputMessage);
    });
  }

  info(): Promise<InfoResult> {
    return new Promise((resolve, reject) => {
      const action = ({ data }: OutputMessageWrapper) => {
        console.log('info action', data);
        const msg: OutputMessage<string> = data;
        if (!msg.hasError) {
          const result: InfoResult = {
            indigoVersion: msg.payload,
            imagoVersions: [],
            isAvailable: true,
          };
          resolve(result);
        } else {
          reject(msg.error);
        }
      };

      this.EE.removeListener(WorkerEvent.Info, action);
      this.EE.addListener(WorkerEvent.Info, action);

      this.worker.postMessage({ type: Command.Info });
    });
  }

  convert(
    data: ConvertData,
    options?: StructServiceOptions,
  ): Promise<ConvertResult> {
    const {
      output_format: outputFormat,
      input_format: inputFormat,
      struct,
    } = data;
    const format = convertMimeTypeToOutputFormat(outputFormat);

    return new Promise((resolve, reject) => {
      const action = ({ data }: OutputMessageWrapper) => {
        console.log('convert action', data);
        const msg: OutputMessage<string> = data;
        if (msg.inputData === struct) {
          if (!msg.hasError) {
            const result: ConvertResult = {
              struct: msg.payload,
              format: outputFormat,
            };
            resolve(result);
          } else {
            reject(msg.error);
          }
        }
      };
      const commandOptions: CommandOptions = {
        ...this.defaultOptions,
        ...options,
        'input-format': inputFormat,
      };

      const commandData: ConvertCommandData = {
        struct,
        format,
        options: commandOptions,
      };

      const inputMessage: InputMessage<ConvertCommandData> = {
        type: Command.Convert,
        data: commandData,
      };

      this.EE.removeListener(WorkerEvent.Convert, action);
      this.EE.addListener(WorkerEvent.Convert, action);

      this.worker.postMessage(inputMessage);
    });
  }

  layout(
    data: LayoutData,
    options?: StructServiceOptions,
  ): Promise<LayoutResult> {
    const { struct, output_format: outputFormat } = data;
    const format = convertMimeTypeToOutputFormat(outputFormat);

    return new Promise((resolve, reject) => {
      const action = ({
        data,
      }: OutputMessageWrapper<{
        struct: string;
        format: string;
        original_format: ChemicalMimeType;
      }>) => {
        console.log('layout action', data);
        const msg: OutputMessage<{
          struct: string;
          format: string;
          original_format: ChemicalMimeType;
        }> = data;
        if (!msg.hasError) {
          const { struct } = msg.payload;
          const result: LayoutResult = {
            struct,
            format: ChemicalMimeType.Mol,
          };
          resolve(result);
        } else {
          reject(msg.error);
        }
      };

      const commandOptions: CommandOptions = {
        ...this.defaultOptions,
        ...options,
        'output-content-type': 'application/json',
      };

      const commandData: LayoutCommandData = {
        struct,
        format,
        options: commandOptions,
      };

      const inputMessage: InputMessage<LayoutCommandData> = {
        type: Command.Layout,
        data: commandData,
      };

      this.EE.removeListener(WorkerEvent.Layout, action);
      this.EE.addListener(WorkerEvent.Layout, action);

      this.worker.postMessage(inputMessage);
    });
  }

  clean(data: CleanData, options?: StructServiceOptions): Promise<CleanResult> {
    const { struct, selected, output_format: outputFormat } = data;
    const format = convertMimeTypeToOutputFormat(outputFormat);

    return new Promise((resolve, reject) => {
      const action = ({ data }: OutputMessageWrapper) => {
        const msg: OutputMessage<string> = data;
        if (!msg.hasError) {
          const result: CleanResult = {
            struct: msg.payload,
            format: ChemicalMimeType.Mol,
          };
          resolve(result);
        } else {
          reject(msg.error);
        }
      };

      const commandOptions: CommandOptions = {
        ...this.defaultOptions,
        ...options,
      };

      const commandData: CleanCommandData = {
        struct,
        format,
        options: commandOptions,
        selectedAtoms: selected || [],
      };

      const inputMessage: InputMessage<CleanCommandData> = {
        type: Command.Clean,
        data: commandData,
      };

      this.EE.removeListener(WorkerEvent.Clean, action);
      this.EE.addListener(WorkerEvent.Clean, action);

      this.worker.postMessage(inputMessage);
    });
  }

  aromatize(
    data: AromatizeData,
    options?: StructServiceOptions,
  ): Promise<AromatizeResult> {
    const { struct, output_format: outputFormat } = data;
    const format = convertMimeTypeToOutputFormat(outputFormat);

    return new Promise((resolve, reject) => {
      const action = ({ data }: OutputMessageWrapper) => {
        const msg: OutputMessage<string> = data;
        if (!msg.hasError) {
          const result: AromatizeResult = {
            struct: msg.payload,
            format: ChemicalMimeType.Mol,
          };
          resolve(result);
        } else {
          reject(msg.error);
        }
      };

      const commandOptions: CommandOptions = {
        ...this.defaultOptions,
        ...options,
      };

      const commandData: AromatizeCommandData = {
        struct,
        format,
        options: commandOptions,
      };

      const inputMessage: InputMessage<AromatizeCommandData> = {
        type: Command.Aromatize,
        data: commandData,
      };

      this.EE.removeListener(WorkerEvent.Aromatize, action);
      this.EE.addListener(WorkerEvent.Aromatize, action);

      this.worker.postMessage(inputMessage);
    });
  }

  dearomatize(
    data: DearomatizeData,
    options?: StructServiceOptions,
  ): Promise<DearomatizeResult> {
    const { struct, output_format: outputFormat } = data;
    const format = convertMimeTypeToOutputFormat(outputFormat);

    return new Promise((resolve, reject) => {
      const action = ({ data }: OutputMessageWrapper) => {
        const msg: OutputMessage<string> = data;
        if (!msg.hasError) {
          const result: AromatizeResult = {
            struct: msg.payload,
            format: ChemicalMimeType.Mol,
          };
          resolve(result);
        } else {
          reject(msg.error);
        }
      };

      const commandOptions: CommandOptions = {
        ...this.defaultOptions,
        ...options,
      };

      const commandData: DearomatizeCommandData = {
        struct,
        format,
        options: commandOptions,
      };

      const inputMessage: InputMessage<DearomatizeCommandData> = {
        type: Command.Dearomatize,
        data: commandData,
      };

      this.EE.removeListener(WorkerEvent.Dearomatize, action);
      this.EE.addListener(WorkerEvent.Dearomatize, action);

      this.worker.postMessage(inputMessage);
    });
  }

  calculateCip(
    data: CalculateCipData,
    options?: StructServiceOptions,
  ): Promise<CalculateCipResult> {
    const { struct, output_format: outputFormat } = data;
    const format = convertMimeTypeToOutputFormat(outputFormat);

    return new Promise((resolve, reject) => {
      const action = ({ data }: OutputMessageWrapper) => {
        const msg: OutputMessage<string> = data;
        if (!msg.hasError) {
          const result: CalculateCipResult = {
            struct: msg.payload,
            format: ChemicalMimeType.Mol,
          };
          resolve(result);
        } else {
          reject(msg.error);
        }
      };

      const commandOptions: CommandOptions = {
        ...this.defaultOptions,
        ...options,
      };

      const commandData: CalculateCipCommandData = {
        struct,
        format,
        options: commandOptions,
      };

      const inputMessage: InputMessage<CalculateCipCommandData> = {
        type: Command.CalculateCip,
        data: commandData,
      };

      this.EE.removeListener(WorkerEvent.CalculateCip, action);
      this.EE.addListener(WorkerEvent.CalculateCip, action);

      this.worker.postMessage(inputMessage);
    });
  }

  automap(
    data: AutomapData,
    options?: StructServiceOptions,
  ): Promise<AutomapResult> {
    const { mode, struct, output_format: outputFormat } = data;
    const format = convertMimeTypeToOutputFormat(outputFormat);

    return new Promise((resolve, reject) => {
      const action = ({ data }: OutputMessageWrapper) => {
        const msg: OutputMessage<string> = data;
        if (!msg.hasError) {
          const result: AutomapResult = {
            struct: msg.payload,
            format: ChemicalMimeType.Mol,
          };
          resolve(result);
        } else {
          reject(msg.error);
        }
      };

      const commandOptions: CommandOptions = {
        ...this.defaultOptions,
        ...options,
      };

      const commandData: AutomapCommandData = {
        struct,
        format,
        mode,
        options: commandOptions,
      };

      const inputMessage: InputMessage<CalculateCipCommandData> = {
        type: Command.Automap,
        data: commandData,
      };

      this.EE.removeListener(WorkerEvent.Automap, action);
      this.EE.addListener(WorkerEvent.Automap, action);

      this.worker.postMessage(inputMessage);
    });
  }

  check(data: CheckData, options?: StructServiceOptions): Promise<CheckResult> {
    const { types, struct } = data;

    return new Promise((resolve, reject) => {
      const action = ({ data }: OutputMessageWrapper) => {
        const msg: OutputMessage<string> = data;
        if (!msg.hasError) {
          const warnings = JSON.parse(msg.payload) as KeyValuePair;

          const result: CheckResult = Object.entries(warnings).reduce(
            (acc, curr) => {
              const [key, value] = curr;
              const mappedPropertyName = mapWarningGroup(key);
              acc[mappedPropertyName] = value;

              return acc;
            },
            {},
          );
          resolve(result);
        } else {
          reject(msg.error);
        }
      };

      const commandOptions: CommandOptions = {
        ...this.defaultOptions,
        ...options,
      };

      const commandData: CheckCommandData = {
        struct,
        types,
        options: commandOptions,
      };

      const inputMessage: InputMessage<CheckCommandData> = {
        type: Command.Check,
        data: commandData,
      };

      this.EE.removeListener(WorkerEvent.Check, action);
      this.EE.addListener(WorkerEvent.Check, action);

      this.worker.postMessage(inputMessage);
    });
  }

  calculate(
    data: CalculateData,
    options?: StructServiceOptions,
  ): Promise<CalculateResult> {
    const { properties, struct, selected } = data;
    return new Promise((resolve, reject) => {
      const action = ({ data }: OutputMessageWrapper) => {
        const msg: OutputMessage<string> = data;
        if (!msg.hasError) {
          const calculatedProperties: CalculateResult = JSON.parse(msg.payload);
          const result: CalculateResult = Object.entries(
            calculatedProperties,
          ).reduce((acc, curr) => {
            const [key, value] = curr;
            const mappedPropertyName = mapCalculatedPropertyName(
              key as CalculateProps,
            );
            if (properties.includes(mappedPropertyName)) {
              acc[mappedPropertyName] = value;
            }

            return acc;
          }, {} as CalculateResult);
          resolve(result);
        } else {
          reject(msg.error);
        }
      };

      const commandOptions: CommandOptions = {
        ...this.defaultOptions,
        ...options,
      };

      const commandData: CalculateCommandData = {
        struct,
        properties,
        options: commandOptions,
        selectedAtoms: selected || [],
      };

      const inputMessage: InputMessage<CalculateCommandData> = {
        type: Command.Calculate,
        data: commandData,
      };

      this.EE.removeListener(WorkerEvent.Calculate, action);
      this.EE.addListener(WorkerEvent.Calculate, action);

      this.worker.postMessage(inputMessage);
    });
  }

  recognize(_blob: Blob, _version: string): Promise<RecognizeResult> {
    return Promise.reject(new Error('Not supported in standalone mode'));
  }

  generateImageAsBase64(
    inputData: string,
    options: GenerateImageOptions = {
      outputFormat: 'png',
      backgroundColor: '',
      bondThickness: 1,
    },
  ): Promise<string> {
    const { outputFormat, backgroundColor, bondThickness, ...restOptions } =
      options;
    return new Promise((resolve, reject) => {
      const action = ({ data }: OutputMessageWrapper) => {
        const msg: OutputMessage<string> = data;
        if (msg.inputData === inputData) {
          if (!msg.hasError) {
            resolve(msg.payload);
          } else {
            reject(msg.error);
          }
        }
      };

      const commandOptions: CommandOptions = {
        ...this.defaultOptions,
        ...restOptions,
      };

      const commandData: GenerateImageCommandData = {
        struct: inputData,
        outputFormat: outputFormat || 'png',
        backgroundColor,
        bondThickness,
        options: commandOptions,
      };

      const inputMessage: InputMessage<GenerateImageCommandData> = {
        type: Command.GenerateImageAsBase64,
        data: commandData,
      };

      this.EE.removeListener(WorkerEvent.GenerateImageAsBase64, action);
      this.EE.addListener(WorkerEvent.GenerateImageAsBase64, action);

      this.worker.postMessage(inputMessage);
    });
  }

  toggleExplicitHydrogens(
    data: ExplicitHydrogensData,
    options?: StructServiceOptions,
  ): Promise<ExplicitHydrogensResult> {
    const { struct, output_format: outputFormat } = data;
    const format = convertMimeTypeToOutputFormat(outputFormat);
    const mode = 'auto';

    return new Promise((resolve, reject) => {
      const action = ({ data }: OutputMessageWrapper) => {
        const msg: OutputMessage<string> = data;
        if (!msg.hasError) {
          const result: AromatizeResult = {
            struct: msg.payload,
            format: ChemicalMimeType.Mol,
          };
          resolve(result);
        } else {
          reject(msg.error);
        }
      };

      const commandOptions: CommandOptions = {
        ...this.defaultOptions,
        ...options,
      };

      const commandData: ExplicitHydrogensCommandData = {
        struct,
        format,
        mode,
        options: commandOptions,
      };

      const inputMessage: InputMessage<ExplicitHydrogensCommandData> = {
        type: Command.ExplicitHydrogens,
        data: commandData,
      };

      this.EE.removeListener(WorkerEvent.ExplicitHydrogens, action);
      this.EE.addListener(WorkerEvent.ExplicitHydrogens, action);

      this.worker.postMessage(inputMessage);
    });
  }
}

export default IndigoService;
