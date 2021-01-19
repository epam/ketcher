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
import { StructServiceProvider } from '../infrastructure/services'

function api(
  base: string,
  structServiceProvider: StructServiceProvider,
  defaultOptions: any
) {
  const baseUrl = !base || /\/$/.test(base) ? base : base + '/'
  const structService = structServiceProvider.createStructService(baseUrl, defaultOptions)
  const info = structService.info()

  return Object.assign(info, {
    convert: structService.convert.bind(structService),
    layout: structService.layout.bind(structService),
    clean: structService.clean.bind(structService),
    aromatize: structService.aromatize.bind(structService),
    dearomatize: structService.dearomatize.bind(structService),
    calculateCip: structService.calculateCip.bind(structService),
    automap: structService.automap.bind(structService),
    check: structService.check.bind(structService),
    calculate: structService.calculate.bind(structService),
    recognize: structService.recognize.bind(structService),
    generatePngAsBase64: structService.generatePngAsBase64.bind(structService)
  })
}

export default api
