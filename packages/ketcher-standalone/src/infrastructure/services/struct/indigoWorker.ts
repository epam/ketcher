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
  CheckCommandData,
  CleanCommandData,
  Command,
  CommandData,
  CommandOptions,
  ConvertCommandData,
  DearomatizeCommandData,
  GenerateImageCommandData,
  GenerateInchIKeyCommandData,
  IndigoModule,
  IndigoOptions,
  InputMessage,
  LayoutCommandData,
  OutputMessage,
  ExplicitHydrogensCommandData,
  CalculateMacromoleculePropertiesCommandData,
} from './indigoWorker.types';

import indigoModuleFn from '_indigo-ketcher-import-alias_';

const normalizeError = (error: unknown): Error => {
  if (error instanceof Error) return error;
  if (typeof error === 'string') return new Error(error);

  try {
    return new Error(JSON.stringify(error));
  } catch {
    return new Error(String(error));
  }
};

/**
 * Removes charge symbol path elements from Indigo-generated SVG.
 * Charge symbols are rendered as simple path elements with fill-rule="nonzero"
 * that appear near the end of the SVG document.
 *
 * @param base64Svg - Base64-encoded SVG string (may include data URL prefix)
 * @returns Base64-encoded SVG without charge paths
 */
function removeChargePathsFromSvg(base64Svg: string): string {
  // Constants for charge path detection
  const CHARGE_PATH_DISTANCE_FROM_END = 15; // Lines from end where charge paths typically appear
  const MAX_CHARGE_PATH_LENGTH = 300; // Max path data length for simple charge symbols

  // Decode SVG from base64
  const svgContent = base64Svg.replace(/^data:image\/svg\+xml;base64,/, '');
  const decodedSvg = atob(svgContent);

  const svgLines = decodedSvg.split('\n');
  const filteredLines = [];

  for (let i = 0; i < svgLines.length; i++) {
    const line = svgLines[i];

    // Charge path detection heuristics:
    // 1. Contains <path> with fill-rule="nonzero"
    // 2. Is near the end (charge paths are added last by Indigo)
    // 3. Is a self-closing tag (ends with />)
    // 4. Has simple path data (charge symbols are geometric shapes: +, -)
    const isNearEnd = i > svgLines.length - CHARGE_PATH_DISTANCE_FROM_END;
    const hasPath = line.includes('<path');
    const hasFillRule = line.includes('fill-rule="nonzero"');
    const isSelfClosing = line.trim().endsWith('/>');

    const pathMatch = line.match(/d="([^"]+)"/);
    const isSimplePath =
      pathMatch && pathMatch[1].length < MAX_CHARGE_PATH_LENGTH;

    const isChargePath =
      hasPath && hasFillRule && isSelfClosing && isNearEnd && isSimplePath;

    if (!isChargePath) {
      filteredLines.push(line);
    }
  }

  const cleanedSvg = filteredLines.join('\n');

  // Return base64 only (wrapper will add data URL prefix)
  return btoa(cleanedSvg);
}

type HandlerType = (
  indigo: IndigoModule,
  indigoOptions: IndigoOptions,
) => string;

const module = indigoModuleFn();

function handle(
  handler: HandlerType,
  options?: CommandOptions,
  messageType?: Command,
  inputData?: string,
) {
  module.then((indigo: IndigoModule) => {
    const indigoOptions = new indigo.MapStringString();
    setOptions(indigoOptions, options ?? {});
    let msg: OutputMessage<string>;
    try {
      const payload = handler(indigo, indigoOptions);
      msg = {
        type: messageType,
        payload,
        hasError: false,
        inputData,
      };
    } catch (error) {
      const errorMessage = normalizeError(error).message;
      msg = {
        type: messageType,
        hasError: true,
        error: errorMessage,
        inputData,
      };
    }

    self.postMessage(msg);
  });
}

function setOptions(indigoOptions: IndigoOptions, options: CommandOptions) {
  for (const [key, value] of Object.entries(options)) {
    if (value == null) continue;
    indigoOptions.set(key, value.toString());
  }
}

self.onmessage = (e: MessageEvent<InputMessage<CommandData>>) => {
  const message = e.data;

  switch (message.type) {
    case Command.GenerateImageAsBase64: {
      const data: GenerateImageCommandData =
        message.data as GenerateImageCommandData;

      const shouldHideCharges =
        data.options?.['render-charges-visible'] === false;

      // Remove render-charges-visible from options before passing to Indigo
      // (Indigo doesn't recognize this parameter)
      const { 'render-charges-visible': _, ...indigoOptions } =
        data.options || {};

      handle(
        (indigo, indigoOptions) => {
          const rendered = indigo.render(data.struct, indigoOptions);

          // Post-process SVG output to remove charge labels if needed
          if (shouldHideCharges && data.outputFormat === 'svg') {
            try {
              return removeChargePathsFromSvg(rendered);
            } catch {
              // Fallback to original output if post-processing fails
              return rendered;
            }
          }

          return rendered;
        },
        {
          ...indigoOptions,
          'render-output-format': data.outputFormat,
          'render-background-color': data.backgroundColor,
        },
        Command.GenerateImageAsBase64,
        data.struct,
      );
      break;
    }

    case Command.Layout: {
      const data: LayoutCommandData = message.data as LayoutCommandData;
      handle(
        (indigo, indigoOptions) => {
          const response = indigo.layout(
            data.struct,
            data.format,
            indigoOptions,
          );
          return JSON.parse(response);
        },
        data.options,
        Command.Layout,
      );
      break;
    }

    case Command.Dearomatize: {
      const data: DearomatizeCommandData =
        message.data as DearomatizeCommandData;
      handle(
        (indigo, indigoOptions) =>
          indigo.dearomatize(data.struct, data.format, indigoOptions),
        data.options,
        Command.Dearomatize,
      );
      break;
    }

    case Command.Check: {
      const data: CheckCommandData = message.data as CheckCommandData;
      handle(
        (indigo, indigoOptions) =>
          indigo.check(
            data.struct,
            data.types?.length ? data.types.join(';') : '',
            indigoOptions,
          ),
        data.options,
        Command.Check,
      );
      break;
    }

    case Command.CalculateCip: {
      const data: CalculateCipCommandData =
        message.data as CalculateCipCommandData;
      handle(
        (indigo, indigoOptions) =>
          indigo.calculateCip(data.struct, data.format, indigoOptions),
        data.options,
        Command.CalculateCip,
      );
      break;
    }

    case Command.Calculate: {
      const data: CalculateCommandData = message.data as CalculateCommandData;
      handle(
        (indigo, indigoOptions) => {
          const selectedAtoms = new indigo.VectorInt();
          data.selectedAtoms.forEach((atomId) =>
            selectedAtoms.push_back(atomId),
          );
          return indigo.calculate(data.struct, indigoOptions, selectedAtoms);
        },
        data.options,
        Command.Calculate,
      );
      break;
    }

    case Command.Automap: {
      const data: AutomapCommandData = message.data as AutomapCommandData;
      handle(
        (indigo, indigoOptions) =>
          indigo.automap(data.struct, data.mode, data.format, indigoOptions),
        data.options,
        Command.Automap,
      );
      break;
    }

    case Command.Aromatize: {
      const data: AromatizeCommandData = message.data as AromatizeCommandData;
      handle(
        (indigo, indigoOptions) =>
          indigo.aromatize(data.struct, data.format, indigoOptions),
        data.options,
        Command.Aromatize,
      );
      break;
    }

    case Command.Clean: {
      const data: CleanCommandData = message.data as CleanCommandData;
      handle(
        (indigo, indigoOptions) => {
          const selectedAtoms = new indigo.VectorInt();
          data.selectedAtoms.forEach((atomId) =>
            selectedAtoms.push_back(atomId),
          );
          return indigo.clean2d(
            data.struct,
            data.format,
            indigoOptions,
            selectedAtoms,
          );
        },
        data.options,
        Command.Clean,
      );
      break;
    }

    case Command.Convert: {
      const data: ConvertCommandData = message.data as ConvertCommandData;
      handle(
        (indigo, indigoOptions) =>
          indigo.convert(data.struct, data.format, indigoOptions),
        data.options,
        Command.Convert,
        data.struct,
      );
      break;
    }

    case Command.Info: {
      handle((indigo) => indigo.version(), undefined, Command.Info);
      break;
    }

    case Command.GetInChIKey: {
      const data: GenerateInchIKeyCommandData =
        message.data as GenerateInchIKeyCommandData;
      handle(
        (indigo, indigoOptions) =>
          indigo.convert(data.struct, 'inchi-key', indigoOptions),
        undefined,
        Command.GetInChIKey,
      );
      break;
    }

    case Command.ExplicitHydrogens: {
      const data: ExplicitHydrogensCommandData =
        message.data as ExplicitHydrogensCommandData;
      handle(
        (indigo, indigoOptions) =>
          indigo.convert_explicit_hydrogens(
            data.struct,
            data.mode,
            data.format,
            indigoOptions,
          ),
        undefined,
        Command.ExplicitHydrogens,
      );
      break;
    }

    case Command.CalculateMacromoleculeProperties: {
      const data: CalculateMacromoleculePropertiesCommandData =
        message.data as CalculateMacromoleculePropertiesCommandData;
      handle(
        (indigo, indigoOptions) =>
          indigo.calculateMacroProperties(data.struct, indigoOptions),
        data.options,
        Command.CalculateMacromoleculeProperties,
      );
      break;
    }

    default:
      throw Error('Unsupported enum type');
  }
};
