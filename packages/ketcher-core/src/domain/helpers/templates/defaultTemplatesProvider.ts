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

import { prefetchSplit, Template, TemplatesProvider } from 'domain/helpers'
import { MolSerializer } from 'domain/serializers'

export class DefaultTemplatesProvider {
  #provider: TemplatesProvider
  #templates: Array<Template>
  #storage: any
  #svgs: Array<string | null>

  constructor(provider, storage) {
    this.#provider = provider
    this.#templates = []
    this.#storage = storage
    this.#svgs = []
  }

  get templates() {
    return this.#templates
  }

  public async initTemplatesProvider(cacheElem) {
    let templates = await this.#provider.getTemplatesList()
    const svgs =
      this.#provider.getPrerenderSvgs &&
      (await this.#provider.getPrerenderSvgs())
    if (svgs) {
      this.#svgs = svgs
    }
    templates = this.mapTemplatesPrerender(templates, cacheElem)
    const userTemplates = this.userTemplates() as Array<Template>

    this.#templates = userTemplates
      ? templates.concat(userTemplates)
      : templates
  }

  private userTemplates() {
    const userLib = this.#storage.getItem('ketcher-tmpls')
    if (!Array.isArray(userLib) || userLib.length === 0) return []
    const molSerializer = new MolSerializer()
    return userLib
      .map((tmpl) => {
        try {
          if (tmpl.props === '') tmpl.props = {}
          tmpl.props.group = 'User Templates'

          return {
            struct: molSerializer.deserialize(tmpl.struct),
            props: tmpl.props
          }
        } catch (ex) {
          return null
        }
      })
      .filter((tmpl) => tmpl !== null)
  }

  private mapTemplatesPrerender(templates, cacheEl): Array<Template> {
    const cachedFiles: Array<string> = this.getSvgFiles(cacheEl)

    return templates.map((tmpl) => {
      const pr = prefetchSplit(tmpl)
      if (pr.file) {
        tmpl.props.prerender =
          cachedFiles.indexOf(pr.file) !== -1 ? `#${pr.id}` : ''
      }

      return tmpl
    })
  }

  private getSvgFiles(cacheEl): Array<string> | [] {
    return this.#svgs.map((svgContent) => {
      if (svgContent) cacheEl.innerHTML += svgContent

      return this.#svgs?.filter((_file, i) => !!this.#svgs[i])
    }) as Array<string> | []
  }
}

export let defaultTemplatesProvider

export const initDefaultTemplatesProvider = (
  provider,
  storage
): DefaultTemplatesProvider => {
  defaultTemplatesProvider = new DefaultTemplatesProvider(provider, storage)
  return defaultTemplatesProvider
}
