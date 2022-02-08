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

import { prefetchStatic, Template, TemplatesProvider } from 'domain/helpers'
import { SdfSerializer } from 'domain/serializers'

export const prefetchSplit = (tmpl): { file: string; id: string } => {
  const pr = tmpl.props.prerender
  const res = pr && pr.split('#', 2)

  return {
    file: pr && res[0],
    id: pr && res[1]
  }
}

export class HttpTemplatesProvider implements TemplatesProvider {
  #templates: Array<Template> | undefined
  #url: string
  #sdfSerializer: SdfSerializer
  #baseUrl: string

  constructor(url, baseUrl) {
    this.#templates = undefined
    this.#url = url
    this.#baseUrl = baseUrl
    this.#sdfSerializer = new SdfSerializer()
  }

  public async getTemplatesList(): Promise<Array<Template>> {
    if (!this.#templates) {
      const text = await prefetchStatic(this.#url)
      this.#templates = this.#sdfSerializer.deserialize(text) as Array<Template>
    }

    return this.#templates
  }

  public async getPrerenderSvgs(): Promise<Array<string | null> | undefined> {
    if (this.#templates) {
      const svgsFiles = this.#templates?.reduce((res, tmpl) => {
        const file = prefetchSplit(tmpl).file

        if (file && res.indexOf(file) === -1) res.push(file)

        return res
      }, [] as Array<string>)

      return Promise.all(
        svgsFiles.map((fn) =>
          prefetchStatic(this.#baseUrl + fn).catch(() => null)
        )
      )
    }

    return undefined
  }
}
