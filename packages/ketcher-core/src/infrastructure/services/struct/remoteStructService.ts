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

import { CoreEditor } from 'application/editor';
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
  OutputFormatType,
  RecognizeResult,
  StructService,
  StructServiceOptions,
} from 'domain/services';
import { KetcherLogger } from 'utilities';
import { getLabelRenderModeForIndigo } from 'infrastructure/services/helpers';
import { ketcherProvider } from 'application/utils';

function pollDeferred(process, complete, timeGap, startTimeGap) {
  return new Promise((resolve, reject) => {
    function iterate() {
      process().then(
        (val) => {
          try {
            if (complete(val)) resolve(val);
            else setTimeout(iterate, timeGap);
          } catch (error) {
            KetcherLogger.error('remoteStructService.ts::pollDeferred', error);
            reject(error);
          }
        },
        (err) => reject(err),
      );
    }
    setTimeout(iterate, startTimeGap || 0);
  });
}

function parametrizeUrl(url, params) {
  return url.replace(/:(\w+)/g, (_, val) => params[val]);
}

function request(
  method: string,
  url: string,
  data?: any,
  headers?: any,
  responseHandler?: (promise: Promise<any>) => Promise<any>,
) {
  let requestUrl = url;
  if (data && method === 'GET') requestUrl = parametrizeUrl(url, data);
  let response: any = fetch(requestUrl, {
    method,
    headers: Object.assign(
      {
        Accept: 'application/json',
      },
      headers,
    ),
    body: method !== 'GET' ? data : undefined,
    credentials: 'same-origin',
  });

  if (responseHandler) {
    response = responseHandler(response);
  } else {
    response = response.then((response) =>
      response
        .json()
        .then((res) => (response.ok ? res : Promise.reject(res.error))),
    );
  }

  return response;
}

function indigoCall(
  method: string,
  url: string,
  baseUrl: string,
  defaultOptions: any,
  customHeaders?: Record<string, string>,
) {
  return function (
    data,
    options,
    responseHandler?: (promise: Promise<any>) => Promise<any>,
  ) {
    const body = Object.assign({}, data);
    body.options = Object.assign(body.options || {}, defaultOptions, options);
    return request(
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

export function pickStandardServerOptions(options?: StructServiceOptions) {
  const ketcherInstance = ketcherProvider.getKetcher();

  return {
    'dearomatize-on-load': options?.['dearomatize-on-load'],
    'smart-layout': options?.['smart-layout'],
    'ignore-stereochemistry-errors': options?.['ignore-stereochemistry-errors'],
    'mass-skip-error-on-pseudoatoms':
      options?.['mass-skip-error-on-pseudoatoms'],
    'gross-formula-add-rsites': options?.['gross-formula-add-rsites'],
    'gross-formula-add-isotopes': options?.['gross-formula-add-isotopes'],
    'ignore-no-chiral-flag': ketcherInstance.editor.options().ignoreChiralFlag,
    'aromatize-skip-superatoms': true,
  };
}

export class RemoteStructService implements StructService {
  private readonly apiPath: string;
  private readonly defaultOptions: StructServiceOptions;
  private readonly customHeaders?: Record<string, string>;

  constructor(
    apiPath: string,
    defaultOptions: StructServiceOptions,
    customHeaders?: Record<string, string>,
  ) {
    this.apiPath = apiPath;
    this.defaultOptions = defaultOptions;
    this.customHeaders = customHeaders;
  }

  getInChIKey(struct: string): Promise<string> {
    return indigoCall(
      'POST',
      'indigo/convert',
      this.apiPath,
      this.defaultOptions,
      this.customHeaders,
    )(
      {
        struct,
        output_format: 'chemical/x-inchi',
      },
      {},
    );
  }

  private getStandardServerOptions(options?: StructServiceOptions) {
    if (!options) {
      return this.defaultOptions;
    }

    return pickStandardServerOptions(options);
  }

  async info(): Promise<InfoResult> {
    let indigoVersion: string;
    let imagoVersions: Array<string>;
    let isAvailable = false;

    try {
      const response = await request('GET', this.apiPath + 'info');
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
      CoreEditor.provideEditorInstance()?.monomersLibraryParsedJson,
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
    };

    return indigoCall(
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

      'render-label-mode': getLabelRenderModeForIndigo(),
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

    return indigoCall(
      'POST',
      'indigo/layout',
      this.apiPath,
      this.defaultOptions,
      this.customHeaders,
    )(data, expandedOptions);
  }

  clean(data: CleanData, options?: StructServiceOptions): Promise<CleanResult> {
    return indigoCall(
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
    return indigoCall(
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
    return indigoCall(
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
    return indigoCall(
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
    return indigoCall(
      'POST',
      'indigo/automap',
      this.apiPath,
      this.defaultOptions,
      this.customHeaders,
    )(data, this.getStandardServerOptions(options));
  }

  check(data: CheckData, options?: StructServiceOptions): Promise<CheckResult> {
    return indigoCall(
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
    return indigoCall(
      'POST',
      'indigo/calculate',
      this.apiPath,
      this.defaultOptions,
      this.customHeaders,
    )(data, this.getStandardServerOptions(options));
  }

  recognize(blob: Blob, version: string): Promise<RecognizeResult> {
    const parVersion = version ? `?version=${version}` : '';
    const req = request(
      'POST',
      this.apiPath + `imago/uploads${parVersion}`,
      blob,
      {
        'Content-Type': blob.type || 'application/octet-stream',
      },
    );
    const status = request.bind(
      null,
      'GET',
      this.apiPath + 'imago/uploads/:id',
    );
    return req
      .then((data) =>
        pollDeferred(
          status.bind(null, { id: data.upload_id }),
          (response: any) => {
            if (response.state === 'FAILURE') throw response;
            return response.state === 'SUCCESS';
          },
          500,
          300,
        ),
      )
      .then((response: any) => ({ struct: response.metadata.mol_str }));
  }

  generateImageAsBase64(
    data: string,
    options?: GenerateImageOptions,
  ): Promise<string> {
    const outputFormat: OutputFormatType = options?.outputFormat || 'png';

    return indigoCall(
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
        'render-hash-spacing': options?.['render-hash-spacing'],
        'render-hash-spacing-unit': options?.['render-hash-spacing-unit'],
        'render-output-sheet-width': options?.['render-output-sheet-width'],
        'render-output-sheet-height': options?.['render-output-sheet-height'],
        'render-output-format': outputFormat,
        'render-label-mode': getLabelRenderModeForIndigo(),
      },
      (response) => response.then((resp) => resp.text()),
    );
  }

  toggleExplicitHydrogens(
    data: ExplicitHydrogensData,
    options?: StructServiceOptions,
  ): Promise<ExplicitHydrogensResult> {
    return indigoCall(
      'POST',
      'indigo/convert_explicit_hydrogens',
      this.apiPath,
      this.defaultOptions,
      this.customHeaders,
    )(data, this.getStandardServerOptions(options));
  }
}
