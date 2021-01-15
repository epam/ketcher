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
import { StructService } from './structService.types'

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

class IndigoService implements StructService {
  private baseUrl: string
  private defaultOptions: any

  constructor(base: string, defaultOptions: any) {
    this.baseUrl = !base || /\/$/.test(base) ? base : base + '/'
    this.defaultOptions = defaultOptions
  }

  async info(): Promise<any> {
    let indigoVersion: any,
      imagoVersions: any,
      isAvailable: boolean = false
    try {
      const response = await request('GET', this.baseUrl + 'info')
      indigoVersion = response['indigo_version']
      imagoVersions = response['imago_versions']
      isAvailable = true
    } catch (e) {
      isAvailable = false
    }

    return {
      indigoVersion,
      imagoVersions,
      isAvailable
    }
  }

  convert(data: any, options: any): Promise<any> {
    return indigoCall(
      'POST',
      'indigo/convert',
      this.baseUrl,
      this.defaultOptions
    )(data, options)
  }

  layout(data: any, options: any): Promise<any> {
    return indigoCall(
      'POST',
      'indigo/layout',
      this.baseUrl,
      this.defaultOptions
    )(data, options)
  }

  clean(data: any, options: any): Promise<any> {
    return indigoCall(
      'POST',
      'indigo/clean',
      this.baseUrl,
      this.defaultOptions
    )(data, options)
  }

  aromatize(data: any, options: any): Promise<any> {
    return indigoCall(
      'POST',
      'indigo/aromatize',
      this.baseUrl,
      this.defaultOptions
    )(data, options)
  }

  dearomatize(data: any, options: any): Promise<any> {
    return indigoCall(
      'POST',
      'indigo/dearomatize',
      this.baseUrl,
      this.defaultOptions
    )(data, options)
  }

  calculateCip(data: any, options: any): Promise<any> {
    return indigoCall(
      'POST',
      'indigo/calculate_cip',
      this.baseUrl,
      this.defaultOptions
    )(data, options)
  }

  automap(data: any, options: any): Promise<any> {
    return indigoCall(
      'POST',
      'indigo/automap',
      this.baseUrl,
      this.defaultOptions
    )(data, options)
  }

  check(data: any, options: any): Promise<any> {
    return indigoCall(
      'POST',
      'indigo/check',
      this.baseUrl,
      this.defaultOptions
    )(data, options)
  }

  calculate(data: any, options: any): Promise<any> {
    return indigoCall(
      'POST',
      'indigo/calculate',
      this.baseUrl,
      this.defaultOptions
    )(data, options)
  }

  recognize(blob: any, version: any): Promise<any> {
    const parVersion = version ? `?version=${version}` : ''
    const req = request(
      'POST',
      this.baseUrl + `imago/uploads${parVersion}`,
      blob,
      {
        'Content-Type': blob.type || 'application/octet-stream'
      }
    )
    const status = request.bind(null, 'GET', this.baseUrl + 'imago/uploads/:id')
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

  generatePngAsBase64(data: string, options: any): Promise<string> {
    return indigoCall(
      'POST',
      'indigo/render',
      this.baseUrl,
      this.defaultOptions
    )(data, options)
  }
}

export default IndigoService
