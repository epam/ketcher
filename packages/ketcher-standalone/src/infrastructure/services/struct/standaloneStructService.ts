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
  CalculateMacromoleculePropertiesCommandData,
  CalculateProps,
  CheckCommandData,
  CleanCommandData,
  Command,
  CommandOptions,
  ConvertCommandData,
  DearomatizeCommandData,
  ExplicitHydrogensCommandData,
  GenerateImageCommandData,
  GenerateInchIKeyCommandData,
  InputMessage,
  LayoutCommandData,
  OutputMessage,
  OutputMessageWrapper,
  SupportedFormat,
  WorkerEvent,
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
  CoreEditor,
  DearomatizeData,
  DearomatizeResult,
  ExplicitHydrogensData,
  ExplicitHydrogensResult,
  GenerateImageOptions,
  getLabelRenderModeForIndigo,
  InfoResult,
  LayoutData,
  LayoutResult,
  RecognizeResult,
  StructService,
  StructServiceOptions,
  pickStandardServerOptions,
  CalculateMacromoleculePropertiesData,
  CalculateMacromoleculePropertiesResult,
  ketcherProvider,
} from 'ketcher-core';

import EventEmitter from 'events';
import {
  STRUCT_SERVICE_INITIALIZED_EVENT,
  STRUCT_SERVICE_NO_RENDER_INITIALIZED_EVENT,
} from './constants';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { indigoWorker } from '_indigo-worker-import-alias_';

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
    case ChemicalMimeType.FASTA: {
      format = SupportedFormat.FASTA;
      break;
    }
    case ChemicalMimeType.SEQUENCE: {
      format = SupportedFormat.SEQUENCE;
      break;
    }
    case ChemicalMimeType.PeptideSequenceThreeLetter: {
      format = SupportedFormat.SEQUENCE_3_LETTER;
      break;
    }
    case ChemicalMimeType.IDT: {
      format = SupportedFormat.IDT;
      break;
    }
    case ChemicalMimeType.HELM: {
      format = SupportedFormat.HELM;
      break;
    }
    case ChemicalMimeType.RDF:
      format = SupportedFormat.RDF;
      break;
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
  [Command.CalculateMacromoleculeProperties]:
    WorkerEvent.CalculateMacromoleculeProperties,
};

class IndigoService implements StructService {
  private readonly defaultOptions: StructServiceOptions;
  private worker: Worker;
  private readonly EE: EventEmitter = new EventEmitter();
  private ketcherId: string | null = null;

  constructor(defaultOptions: StructServiceOptions) {
    this.defaultOptions = defaultOptions;
    this.worker = indigoWorker;
    this.worker.onmessage = (e: MessageEvent<OutputMessage<string>>) => {
      if (e.data.type === Command.Info) {
        const callbackMethod = process.env.SEPARATE_INDIGO_RENDER
          ? this.callIndigoNoRenderLoadedCallback
          : this.callIndigoLoadedCallback;

        callbackMethod();
      }

      const message: OutputMessage<string> = e.data;
      if (message.type !== undefined) {
        const event = messageTypeToEventMapping[message.type];
        this.EE.emit(event, { data: message });
      }
    };
  }

  public addKetcherId(ketcherId: string) {
    this.ketcherId = ketcherId;
  }

  private getStandardServerOptions(options?: StructServiceOptions) {
    if (!options) {
      return this.defaultOptions;
    }
    if (!this.ketcherId) {
      throw new Error('Cannot getting options because there are no ketcherId');
    }

    return pickStandardServerOptions(this.ketcherId, options);
  }

  private callIndigoNoRenderLoadedCallback() {
    window.dispatchEvent(new Event(STRUCT_SERVICE_NO_RENDER_INITIALIZED_EVENT));
  }

  private callIndigoLoadedCallback() {
    window.dispatchEvent(new Event(STRUCT_SERVICE_INITIALIZED_EVENT));
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
      let monomerLibrary;
      if (this.ketcherId) {
        const ketcher = ketcherProvider.getKetcher(this.ketcherId);
        const coreEditorId = ketcher.coreEditorId;

        if (coreEditorId) {
          monomerLibrary = JSON.stringify(
            CoreEditor.provideEditorInstance(coreEditorId)
              ?.monomersLibraryParsedJson,
          );
        }
      }
      const commandOptions: CommandOptions = {
        ...this.getStandardServerOptions(options),
        'bond-length-unit': options?.['bond-length-unit'],
        'bond-length': options?.['bond-length'],
        'reaction-component-margin-size-unit':
          options?.['reaction-component-margin-size-unit'],
        'reaction-component-margin-size':
          options?.['reaction-component-margin-size'],
        'image-resolution': options?.['image-resolution'],
        'input-format': inputFormat,
        'molfile-saving-mode': options?.['molfile-saving-mode'],
        'sequence-type': options?.['sequence-type'],
        monomerLibrary,
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
        ...this.getStandardServerOptions(options),
        'output-content-type': 'application/json',

        'render-label-mode': this.ketcherId
          ? getLabelRenderModeForIndigo(this.ketcherId)
          : undefined,
        'render-font-size': options?.['render-font-size'],
        'render-font-size-unit': options?.['render-font-size-unit'],
        'render-font-size-sub': options?.['render-font-size-sub'],
        'render-font-size-sub-unit': options?.['render-font-size-sub-unit'],
        'bond-length-unit': options?.['bond-length-unit'],
        'bond-length': options?.['bond-length'],
        'reaction-component-margin-size-unit':
          options?.['reaction-component-margin-size-unit'],
        'reaction-component-margin-size':
          options?.['reaction-component-margin-size'],
        'image-resolution': options?.['image-resolution'],
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

      const commandData: CleanCommandData = {
        struct,
        format,
        options: this.getStandardServerOptions(options),
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

      const commandData: AromatizeCommandData = {
        struct,
        format,
        options: this.getStandardServerOptions(options),
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

      const commandData: DearomatizeCommandData = {
        struct,
        format,
        options: this.getStandardServerOptions(options),
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

      const commandData: CalculateCipCommandData = {
        struct,
        format,
        options: this.getStandardServerOptions(options),
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

      const commandData: AutomapCommandData = {
        struct,
        format,
        mode,
        options: this.getStandardServerOptions(options),
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
              acc[mappedPropertyName] = value as string;

              return acc;
            },
            {} as CheckResult,
          );
          resolve(result);
        } else {
          reject(msg.error);
        }
      };

      const commandData: CheckCommandData = {
        struct,
        types,
        options: this.getStandardServerOptions(options),
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

      const commandData: CalculateCommandData = {
        struct,
        properties,
        options: this.getStandardServerOptions(options),
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
    },
  ): Promise<string> {
    const { outputFormat, backgroundColor, ...restOptions } = options;

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
        ...this.getStandardServerOptions(restOptions),
        'render-label-mode': this.ketcherId
          ? getLabelRenderModeForIndigo(this.ketcherId)
          : undefined,
        'render-coloring': restOptions['render-coloring'],
        'render-font-size': restOptions['render-font-size'],
        'render-font-size-unit': restOptions['render-font-size-unit'],
        'render-font-size-sub': restOptions['render-font-size-sub'],
        'render-font-size-sub-unit': restOptions['render-font-size-sub-unit'],
        'image-resolution': restOptions['image-resolution'],
        'bond-length-unit': restOptions['bond-length-unit'],
        'bond-length': restOptions['bond-length'],
        'render-bond-thickness': restOptions['render-bond-thickness'],
        'render-bond-thickness-unit': restOptions['render-bond-thickness-unit'],
        'render-bond-spacing': restOptions['render-bond-spacing'],
        'render-stereo-bond-width': restOptions['render-stereo-bond-width'],
        'render-stereo-bond-width-unit':
          restOptions['render-stereo-bond-width-unit'],
        'render-hash-spacing': restOptions['render-hash-spacing'],
        'render-hash-spacing-unit': restOptions['render-hash-spacing-unit'],
        'render-output-sheet-width': restOptions['render-output-sheet-width'],
        'render-output-sheet-height': restOptions['render-output-sheet-height'],
      };

      const commandData: GenerateImageCommandData = {
        struct: inputData,
        outputFormat: outputFormat || 'png',
        backgroundColor,
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

      const commandData: ExplicitHydrogensCommandData = {
        struct,
        format,
        mode,
        options: this.getStandardServerOptions(options),
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

  calculateMacromoleculeProperties(
    data: CalculateMacromoleculePropertiesData,
    options?: StructServiceOptions,
  ): Promise<CalculateMacromoleculePropertiesResult> {
    const { struct } = data;

    return new Promise((resolve, reject) => {
      const action = ({ data }: OutputMessageWrapper) => {
        const msg: OutputMessage<string> = data;

        if (!msg.hasError) {
          resolve(JSON.parse(msg.payload));
        } else {
          reject(msg.error);
        }
      };

      const commandData: CalculateMacromoleculePropertiesCommandData = {
        struct,
        options: {
          ...this.getStandardServerOptions(options),
          upc: options?.upc,
          nac: options?.nac,
        },
      };
      const inputMessage: InputMessage<CalculateMacromoleculePropertiesData> = {
        type: Command.CalculateMacromoleculeProperties,
        data: commandData,
      };

      this.EE.removeAllListeners(WorkerEvent.CalculateMacromoleculeProperties);
      this.EE.addListener(WorkerEvent.CalculateMacromoleculeProperties, action);
      this.worker.postMessage(inputMessage);
    });
  }

  public destroy() {
    this.worker.terminate();
    this.worker.onmessage = null;
  }
}

export default IndigoService;
