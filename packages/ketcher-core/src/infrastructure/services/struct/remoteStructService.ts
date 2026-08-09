import { provideEditorInstance } from 'application/editor/editorSingleton';
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
  type AromatizeData,
  type AromatizeResult,
  type AutomapData,
  type AutomapResult,
  type CalculateCipData,
  type CalculateCipResult,
  type CalculateData,
  type CalculateMacromoleculePropertiesData,
  type CalculateMacromoleculePropertiesResult,
  type CalculateResult,
  type CheckData,
  type CheckResult,
  type CleanData,
  type CleanResult,
  type ConvertData,
  type ConvertResult,
  type DearomatizeData,
  type DearomatizeResult,
  type ExplicitHydrogensData,
  type ExplicitHydrogensResult,
  type GenerateImageOptions,
  type ImagoStatusResponse,
  type ImagoUploadResponse,
  type InfoResult,
  type LayoutData,
  type LayoutResult,
  type OutputFormatType,
  type RecognizeResult,
  type StructService,
  type StructServiceOptions,
} from 'domain/services';
import { ChemicalMimeType } from 'domain/services/struct/structService.types';
import { KetcherLogger, normalizeError } from 'utilities';
import { getLabelRenderModeForIndigo } from 'infrastructure/services/helpers';
import { ketcherProvider } from 'application/ketcherProvider';

function pollDeferred<T>(
  process: () => Promise<T>,
  complete: (val: T) => boolean,
  timeGap: number,
  startTimeGap?: number,
) {
  return new Promise<T>((resolve, reject) => {
    function iterate() {
      process().then(
        (val) => {
          try {
            if (complete(val)) resolve(val);
            else setTimeout(iterate, timeGap);
          } catch (error) {
            KetcherLogger.error('remoteStructService.ts::pollDeferred', error);
            reject(normalizeError(error));
          }
        },
        (err) => reject(normalizeError(err)),
      );
    }
    setTimeout(iterate, startTimeGap ?? 0);
  });
}

function parametrizeUrl(url: string, params: Record<string, string>) {
  return url.replace(/:(\w+)/g, (_, val) => params[val]);
}

function request<T = unknown>(
  method: string,
  url: string,
  data?: string | Blob | Record<string, string>,
  headers?: Record<string, string>,
  responseHandler?: (promise: Promise<Response>) => Promise<T>,
): Promise<T> {
  let requestUrl = url;
  if (data && method === 'GET')
    requestUrl = parametrizeUrl(url, data as Record<string, string>);
  const fetchResponse: Promise<Response> = fetch(requestUrl, {
    method,
    headers: {
      Accept: 'application/json',
      ...(headers ?? {}),
    },
    body: method !== 'GET' ? (data as string | Blob) : undefined,
    credentials: 'same-origin',
  });

  let response: Promise<T>;
  if (responseHandler) {
    response = responseHandler(fetchResponse);
  } else {
    response = fetchResponse.then((res) =>
      res
        .json()
        .then((json) =>
          res.ok ? json : Promise.reject(new Error(json.error)),
        ),
    ) as Promise<T>;
  }

  return response;
}

function indigoCall<TData extends Record<string, unknown>, TResult>(
  method: string,
  url: string,
  baseUrl: string,
  defaultOptions: StructServiceOptions,
  customHeaders?: Record<string, string>,
) {
  return function (
    data: TData,
    options: Record<string, unknown>,
    responseHandler?: (promise: Promise<Response>) => Promise<TResult>,
  ): Promise<TResult> {
    const body: Record<string, unknown> = { ...(data ?? {}) };
    body.options = {
      ...((body.options as Record<string, unknown>) ?? {}),
      ...(defaultOptions ?? {}),
      ...(options ?? {}),
    };
    return request<TResult>(
      method,
      baseUrl + url,
      JSON.stringify(body),
      {
        'Content-Type': 'application/json',
        ...customHeaders,
      },
      responseHandler,
    );
  };
}

export function pickStandardServerOptions(
  ketcherId: string,
  options?: StructServiceOptions,
) {
  const ketcherInstance = ketcherProvider.getKetcher(ketcherId);

  return {
    'dearomatize-on-load': options?.['dearomatize-on-load'],
    'aromaticity-model': 'generic',
    'smart-layout': options?.['smart-layout'],
    'ignore-stereochemistry-errors': options?.['ignore-stereochemistry-errors'],
    'mass-skip-error-on-pseudoatoms':
      options?.['mass-skip-error-on-pseudoatoms'],
    'gross-formula-add-rsites': options?.['gross-formula-add-rsites'],
    'gross-formula-add-isotopes': options?.['gross-formula-add-isotopes'],
    'ignore-no-chiral-flag': ketcherInstance.editor.options().ignoreChiralFlag,
    'aromatize-skip-superatoms': true,
    'valence-mode': options?.['valence-mode'],
  };
}

export class RemoteStructService implements StructService {
  private readonly apiPath: string;
  private readonly defaultOptions: StructServiceOptions;
  private readonly customHeaders?: Record<string, string>;
  private ketcherId: string | null;

  constructor(
    apiPath: string,
    defaultOptions: StructServiceOptions,
    customHeaders?: Record<string, string>,
  ) {
    this.apiPath = apiPath;
    this.defaultOptions = defaultOptions;
    this.customHeaders = customHeaders;
    this.ketcherId = null;
  }

  addKetcherId(ketcherId: string) {
    this.ketcherId = ketcherId;
  }

  getInChIKey(struct: string): Promise<string> {
    return indigoCall<{ struct: string; output_format: ChemicalMimeType }, string>(
      'POST',
      'indigo/convert',
      this.apiPath,
      this.defaultOptions,
      this.customHeaders,
    )(
      {
        struct,
        output_format: ChemicalMimeType.InChIKey,
      },
      {},
    );
  }

  private getStandardServerOptions(options?: StructServiceOptions) {
    if (!options) {
      return this.defaultOptions;
    }
    if (!this.ketcherId) {
      throw new Error('ketcherId is missed when options getting');
    }

    return pickStandardServerOptions(this.ketcherId, options);
  }

  async info(): Promise<InfoResult> {
    let indigoVersion: string;
    let imagoVersions: Array<string>;
    let isAvailable = false;

    try {
      const response = await request<{
        indigo_version: string;
        imago_versions: Array<string>;
      }>(
        'GET',
        this.apiPath + 'info',
        undefined,
        this.customHeaders,
      );
      indigoVersion = response.indigo_version;
      imagoVersions = response.imago_versions;
      isAvailable = true;
    } catch (e) {
      KetcherLogger.error(
        'remoteStructService.ts::RemoteStructService::info',
        e,
      );
      indigoVersion = '';
      imagoVersions = [];
      isAvailable = false;
    }

    return {
      indigoVersion,
      imagoVersions,
      isAvailable,
    };
  }

  convert(
    data: ConvertData,
    options?: StructServiceOptions,
  ): Promise<ConvertResult> {
    const monomerLibrary = JSON.stringify(
      provideEditorInstance()?.monomersLibraryParsedJson,
    );
    const expandedOptions = {
      monomerLibrary,
      ...this.getStandardServerOptions(options),
      'bond-length-unit': options?.['bond-length-unit'],
      'bond-length': options?.['bond-length'],
      'reaction-component-margin-size-unit':
        options?.['reaction-component-margin-size-unit'],
      'reaction-component-margin-size':
        options?.['reaction-component-margin-size'],
      'image-resolution': options?.['image-resolution'],
      'molfile-saving-mode': options?.['molfile-saving-mode'],
      'monomer-library-saving-mode': options?.['monomer-library-saving-mode'],
      'molfile-saving-skip-date': options?.['molfile-saving-skip-date'],
      'output-content-type': options?.['output-content-type'],
      'sequence-type': options?.['sequence-type'],
    };

    return indigoCall<ConvertData, ConvertResult>(
      'POST',
      'indigo/convert',
      this.apiPath,
      this.defaultOptions,
      this.customHeaders,
    )(data, expandedOptions);
  }

  layout(
    data: LayoutData,
    options?: StructServiceOptions,
  ): Promise<LayoutResult> {
    const expandedOptions = {
      ...this.getStandardServerOptions(options),

      'render-label-mode': this.ketcherId
        ? getLabelRenderModeForIndigo(this.ketcherId)
        : undefined,
      'render-font-size': options?.['render-font-size'],
      'render-font-size-unit': options?.['render-font-size-unit'],
      'render-font-size-sub': options?.['render-font-size-sub'],
      'render-font-size-sub-unit': options?.['render-font-size-sub-unit'],
      'output-content-type': 'application/json',
      'bond-length-unit': options?.['bond-length-unit'],
      'bond-length': options?.['bond-length'],
      'reaction-component-margin-size-unit':
        options?.['reaction-component-margin-size-unit'],
      'reaction-component-margin-size':
        options?.['reaction-component-margin-size'],
      'image-resolution': options?.['image-resolution'],
    };

    return indigoCall<LayoutData, LayoutResult>(
      'POST',
      'indigo/layout',
      this.apiPath,
      this.defaultOptions,
      this.customHeaders,
    )(data, expandedOptions);
  }

  clean(data: CleanData, options?: StructServiceOptions): Promise<CleanResult> {
    return indigoCall<CleanData, CleanResult>(
      'POST',
      'indigo/clean',
      this.apiPath,
      this.defaultOptions,
      this.customHeaders,
    )(data, this.getStandardServerOptions(options));
  }

  aromatize(
    data: AromatizeData,
    options?: StructServiceOptions,
  ): Promise<AromatizeResult> {
    return indigoCall<AromatizeData, AromatizeResult>(
      'POST',
      'indigo/aromatize',
      this.apiPath,
      this.defaultOptions,
      this.customHeaders,
    )(data, this.getStandardServerOptions(options));
  }

  dearomatize(
    data: DearomatizeData,
    options?: StructServiceOptions,
  ): Promise<DearomatizeResult> {
    return indigoCall<DearomatizeData, DearomatizeResult>(
      'POST',
      'indigo/dearomatize',
      this.apiPath,
      this.defaultOptions,
      this.customHeaders,
    )(data, this.getStandardServerOptions(options));
  }

  calculateCip(
    data: CalculateCipData,
    options?: StructServiceOptions,
  ): Promise<CalculateCipResult> {
    return indigoCall<CalculateCipData, CalculateCipResult>(
      'POST',
      'indigo/calculate_cip',
      this.apiPath,
      this.defaultOptions,
      this.customHeaders,
    )(data, this.getStandardServerOptions(options));
  }

  automap(
    data: AutomapData,
    options?: StructServiceOptions,
  ): Promise<AutomapResult> {
    return indigoCall<AutomapData, AutomapResult>(
      'POST',
      'indigo/automap',
      this.apiPath,
      this.defaultOptions,
      this.customHeaders,
    )(data, this.getStandardServerOptions(options));
  }

  check(data: CheckData, options?: StructServiceOptions): Promise<CheckResult> {
    return indigoCall<CheckData, CheckResult>(
      'POST',
      'indigo/check',
      this.apiPath,
      this.defaultOptions,
      this.customHeaders,
    )(data, this.getStandardServerOptions(options));
  }

  calculate(
    data: CalculateData,
    options?: StructServiceOptions,
  ): Promise<CalculateResult> {
    return indigoCall<CalculateData, CalculateResult>(
      'POST',
      'indigo/calculate',
      this.apiPath,
      this.defaultOptions,
      this.customHeaders,
    )(data, this.getStandardServerOptions(options));
  }

  recognize(blob: Blob, version: string): Promise<RecognizeResult> {
    const parVersion = version ? `?version=${version}` : '';
    const req = request<ImagoUploadResponse>(
      'POST',
      this.apiPath + `imago/uploads${parVersion}`,
      blob,
      {
        'Content-Type': blob.type ?? 'application/octet-stream',
        ...this.customHeaders,
      },
    );
    const statusUrl = this.apiPath + 'imago/uploads/:id';
    const { customHeaders } = this;
    const status = (data: { id: string }) =>
      request<ImagoStatusResponse>('GET', statusUrl, data, customHeaders);
    return req
      .then((data) =>
        pollDeferred(
          status.bind(null, { id: data.upload_id }),
          (response: ImagoStatusResponse) => {
            if (response.state === 'FAILURE')
              throw new Error(JSON.stringify(response));
            return response.state === 'SUCCESS';
          },
          500,
          300,
        ),
      )
      .then((response) => ({
        struct: response.metadata?.mol_str ?? '',
        output_format: ChemicalMimeType.Mol,
      }));
  }

  generateImageAsBase64(
    data: string,
    options?: GenerateImageOptions,
  ): Promise<string> {
    const outputFormat: OutputFormatType = options?.outputFormat ?? 'png';

    return indigoCall<{ struct: string }, string>(
      'POST',
      'indigo/render',
      this.apiPath,
      this.defaultOptions,
      this.customHeaders,
    )(
      { struct: data },
      {
        ...this.getStandardServerOptions(options),
        'render-coloring': options?.['render-coloring'],
        'render-font-size': options?.['render-font-size'],
        'render-font-size-unit': options?.['render-font-size-unit'],
        'render-font-size-sub': options?.['render-font-size-sub'],
        'render-font-size-sub-unit': options?.['render-font-size-sub-unit'],
        'image-resolution': options?.['image-resolution'],
        'bond-length-unit': options?.['bond-length-unit'],
        'bond-length': options?.['bond-length'],
        'render-bond-thickness': options?.['render-bond-thickness'],
        'render-bond-thickness-unit': options?.['render-bond-thickness-unit'],
        'render-bond-spacing': options?.['render-bond-spacing'],
        'render-stereo-bond-width': options?.['render-stereo-bond-width'],
        'render-stereo-bond-width-unit':
          options?.['render-stereo-bond-width-unit'],
        'render-stereo-style': options?.['render-stereo-style'],
        'render-hash-spacing': options?.['render-hash-spacing'],
        'render-hash-spacing-unit': options?.['render-hash-spacing-unit'],
        'render-output-sheet-width': options?.['render-output-sheet-width'],
        'render-output-sheet-height': options?.['render-output-sheet-height'],
        'render-output-format': outputFormat,
        'render-label-mode': this.ketcherId
          ? getLabelRenderModeForIndigo(this.ketcherId)
          : undefined,
      },
      (response) => response.then((resp) => resp.text()) as Promise<string>,
    );
  }

  toggleExplicitHydrogens(
    data: ExplicitHydrogensData,
    options?: StructServiceOptions,
  ): Promise<ExplicitHydrogensResult> {
    return indigoCall<ExplicitHydrogensData, ExplicitHydrogensResult>(
      'POST',
      'indigo/convert_explicit_hydrogens',
      this.apiPath,
      this.defaultOptions,
      this.customHeaders,
    )(data, this.getStandardServerOptions(options));
  }

  calculateMacromoleculeProperties(
    data: CalculateMacromoleculePropertiesData,
    options?: StructServiceOptions,
  ): Promise<CalculateMacromoleculePropertiesResult> {
    return indigoCall<CalculateMacromoleculePropertiesData, CalculateMacromoleculePropertiesResult>(
      'POST',
      'indigo/calculateMacroProperties',
      this.apiPath,
      this.defaultOptions,
      this.customHeaders,
    )(data, {
      ...this.getStandardServerOptions(options),
      upc: options?.upc,
      nac: options?.nac,
    });
  }
}
