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
  StructService,
  CheckData,
  AutomapData,
  CalculateCipData,
  DearomatizeData,
  AromatizeData,
  CleanData,
  LayoutData,
  CalculateData,
  StructServiceOptions,
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
  RecognizeResult,
  GenerateImageOptions
} from './structService.types'

function pollDeferred(process, complete, timeGap, startTimeGap) {
  return new Promise((resolve, reject) => {
    function iterate() {
      process().then(
        val => {
          try {
            if (complete(val)) resolve(val)
            else setTimeout(iterate, timeGap)
          } catch (e) {
            reject(e)
          }
        },
        err => reject(err)
      )
    }
    setTimeout(iterate, startTimeGap || 0)
  })
}

function parametrizeUrl(url, params) {
  return url.replace(/:(\w+)/g, (_, val) => params[val])
}

function request(method: string, url: string, data?: any, headers?: any) {
  let requestUrl = url
  if (data && method === 'GET') requestUrl = parametrizeUrl(url, data)
  return fetch(requestUrl, {
    method,
    headers: Object.assign(
      {
        Accept: 'application/json'
      },
      headers
    ),
    body: method !== 'GET' ? data : undefined,
    credentials: 'same-origin'
  })
    .then(response =>
      response
        .json()
        .then(res => (response.ok ? res : Promise.reject(res.error)))
    )
    .catch(err => {
      throw Error(err)
    })
}

function indigoCall(
  method: string,
  url: string,
  baseUrl: string,
  defaultOptions: any
) {
  return function (data, options) {
    const body = Object.assign({}, data)
    body.options = Object.assign(body.options || {}, defaultOptions, options)
    return request(method, baseUrl + url, JSON.stringify(body), {
      'Content-Type': 'application/json'
    })
  }
}

class RemoteStructService implements StructService {
  private readonly apiPath: string
  private readonly defaultOptions: StructServiceOptions

  constructor(apiPath: string, defaultOptions: StructServiceOptions) {
    this.apiPath = apiPath
    this.defaultOptions = defaultOptions
  }

  async info(): Promise<InfoResult> {
    let indigoVersion: string
    let imagoVersions: Array<string>
    let isAvailable: boolean = false

    try {
      const response = await request('GET', this.apiPath + 'info')
      indigoVersion = response['indigo_version']
      imagoVersions = response['imago_versions']
      isAvailable = true
    } catch (e) {
      indigoVersion = ''
      imagoVersions = []
      isAvailable = false
    }

    return {
      indigoVersion,
      imagoVersions,
      isAvailable
    }
  }

  convert(
    data: ConvertData,
    options?: StructServiceOptions
  ): Promise<ConvertResult> {
    return indigoCall(
      'POST',
      'indigo/convert',
      this.apiPath,
      this.defaultOptions
    )(data, options)
  }

  layout(
    data: LayoutData,
    options?: StructServiceOptions
  ): Promise<LayoutResult> {
    return indigoCall(
      'POST',
      'indigo/layout',
      this.apiPath,
      this.defaultOptions
    )(data, options)
  }

  clean(data: CleanData, options?: StructServiceOptions): Promise<CleanResult> {
    return indigoCall(
      'POST',
      'indigo/clean',
      this.apiPath,
      this.defaultOptions
    )(data, options)
  }

  aromatize(
    data: AromatizeData,
    options?: StructServiceOptions
  ): Promise<AromatizeResult> {
    return indigoCall(
      'POST',
      'indigo/aromatize',
      this.apiPath,
      this.defaultOptions
    )(data, options)
  }

  dearomatize(
    data: DearomatizeData,
    options?: StructServiceOptions
  ): Promise<DearomatizeResult> {
    return indigoCall(
      'POST',
      'indigo/dearomatize',
      this.apiPath,
      this.defaultOptions
    )(data, options)
  }

  calculateCip(
    data: CalculateCipData,
    options?: StructServiceOptions
  ): Promise<CalculateCipResult> {
    return indigoCall(
      'POST',
      'indigo/calculate_cip',
      this.apiPath,
      this.defaultOptions
    )(data, options)
  }

  automap(
    data: AutomapData,
    options?: StructServiceOptions
  ): Promise<AutomapResult> {
    return indigoCall(
      'POST',
      'indigo/automap',
      this.apiPath,
      this.defaultOptions
    )(data, options)
  }

  check(data: CheckData, options?: StructServiceOptions): Promise<CheckResult> {
    return indigoCall(
      'POST',
      'indigo/check',
      this.apiPath,
      this.defaultOptions
    )(data, options)
  }

  calculate(
    data: CalculateData,
    options?: StructServiceOptions
  ): Promise<CalculateResult> {
    return indigoCall(
      'POST',
      'indigo/calculate',
      this.apiPath,
      this.defaultOptions
    )(data, options)
  }

  recognize(blob: Blob, version: string): Promise<RecognizeResult> {
    const parVersion = version ? `?version=${version}` : ''
    const req = request(
      'POST',
      this.apiPath + `imago/uploads${parVersion}`,
      blob,
      {
        'Content-Type': blob.type || 'application/octet-stream'
      }
    )
    const status = request.bind(null, 'GET', this.apiPath + 'imago/uploads/:id')
    return req
      .then(data =>
        pollDeferred(
          status.bind(null, { id: data.upload_id }),
          (response: any) => {
            if (response.state === 'FAILURE') throw response
            return response.state === 'SUCCESS'
          },
          500,
          300
        )
      )
      .then((response: any) => ({ struct: response.metadata.mol_str }))
  }

  generateImageAsBase64(
    data: string,
    options?: GenerateImageOptions
  ): Promise<string> {
    return indigoCall(
      'POST',
      'indigo/render',
      this.apiPath,
      this.defaultOptions
    )({ struct: data }, options)
  }
}

export default RemoteStructService
