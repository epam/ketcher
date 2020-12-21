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
import { Module as IndigoModule } from './../../../generated/libindigo'
import { StructService } from './structService.types'

class IndigoService implements StructService {
  private baseUrl: string
  private defaultOptions: any
  private indigoModule: any

  constructor(base: string, defaultOptions: any) {
    this.baseUrl = !base || /\/$/.test(base) ? base : base + '/'
    this.defaultOptions = defaultOptions
    this.indigoModule = this.indigoModule()
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
}

export default IndigoService
