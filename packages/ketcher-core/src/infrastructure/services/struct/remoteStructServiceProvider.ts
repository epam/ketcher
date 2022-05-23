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
  ServiceMode,
  StructService,
  StructServiceOptions,
  StructServiceProvider
} from 'domain/services'

import { RemoteStructService } from './remoteStructService'

export class RemoteStructServiceProvider implements StructServiceProvider {
  private readonly apiPath: string
  mode: ServiceMode = 'remote'
  customHeaders?: Record<string, string>

  constructor(apiPath: string, customHeaders?: Record<string, string>) {
    let currentApiPath = apiPath
    this.customHeaders = customHeaders
    const params = new URLSearchParams(document.location.search)
    if (params.has('api_path')) {
      currentApiPath = params.get('api_path')!
    }
    this.apiPath =
      !currentApiPath || /\/$/.test(currentApiPath)
        ? currentApiPath
        : currentApiPath + '/'
  }

  createStructService(options: StructServiceOptions): StructService {
    return new RemoteStructService(this.apiPath, options, this.customHeaders)
  }
}
