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

import { prefetchStatic, Template } from 'domain/helpers'
import { SdfSerializer } from 'domain/serializers'

export class HttpTemplatesProvider {
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

  public async getTemplatesList(cacheElem): Promise<Array<Template>> {
    if (!this.#templates) {
      const text = await prefetchStatic(this.#url)
      this.#templates = await this.deserializeSdfTemplates(text, cacheElem)
    }

    return this.#templates
  }

  private deserializeSdfTemplates(text, cacheEl): Promise<Array<Template>> {
    const templates = this.#sdfSerializer.deserialize(text) as Array<Template>
    const prefetch = this.prefetchRender(templates, this.#baseUrl, cacheEl)

    return prefetch.then((cachedFiles) =>
      templates.map((tmpl) => {
        const pr = this.prefetchSplit(tmpl)
        if (pr.file)
          tmpl.props.prerender =
            cachedFiles.indexOf(pr.file) !== -1 ? `#${pr.id}` : ''

        return tmpl
      })
    )
  }

  private prefetchSplit(tmpl) {
    const pr = tmpl.props.prerender
    const res = pr && pr.split('#', 2)

    return {
      file: pr && res[0],
      id: pr && res[1]
    }
  }

  private prefetchRender(tmpls, baseUrl, cacheEl) {
    const files = tmpls.reduce((res, tmpl) => {
      const file = this.prefetchSplit(tmpl).file

      if (file && res.indexOf(file) === -1) res.push(file)

      return res
    }, [])
    const fetch = Promise.all(
      files.map((fn) => prefetchStatic(baseUrl + fn).catch(() => null))
    )

    return fetch.then((svgs) => {
      svgs.forEach((svgContent) => {
        if (svgContent) cacheEl.innerHTML += svgContent
      })

      return files.filter((_file, i) => !!svgs[i])
    })
  }
}
