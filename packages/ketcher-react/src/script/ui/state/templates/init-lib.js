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

import { KetSerializer, SdfSerializer } from 'ketcher-core'

import { appUpdate } from '../options'
import { storage } from '../../storage-ext'
import templatesRawData from '../../../../templates/library.sdf'

export function initLib(lib) {
  return {
    type: 'TMPL_INIT',
    data: { lib }
  }
}

export default function initTmplLib(dispatch, baseUrl, cacheEl) {
  const fileName = 'library.sdf'
  return deserializeSdfTemplates(baseUrl, cacheEl, fileName).then((res) => {
    const lib = res.concat(userTmpls())
    dispatch(initLib(lib))
    dispatch(appUpdate({ templates: true }))
  })
}

const deserializeSdfTemplates = (baseUrl, cacheEl, fileName) => {
  const sdfSerializer = new SdfSerializer()
  const tmpls = sdfSerializer.deserialize(templatesRawData)
  const prefetch = prefetchRender(tmpls, baseUrl + '/templates/', cacheEl)

  return prefetch.then((cachedFiles) =>
    tmpls.map((tmpl) => {
      const pr = prefetchSplit(tmpl)
      if (pr.file)
        tmpl.props.prerender =
          cachedFiles.indexOf(pr.file) !== -1 ? `#${pr.id}` : ''

      return tmpl
    })
  )
}

function userTmpls() {
  const userLib = storage.getItem('ketcher-tmpls')
  if (!Array.isArray(userLib) || userLib.length === 0) return []
  const ketSerializer = new KetSerializer()
  return userLib
    .map((tmpl) => {
      try {
        if (tmpl.props === '') tmpl.props = {}
        tmpl.props.group = 'User Templates'

        return {
          struct: ketSerializer.deserialize(tmpl.struct),
          props: tmpl.props
        }
      } catch (ex) {
        return null
      }
    })
    .filter((tmpl) => tmpl !== null)
}

export function prefetchStatic(url) {
  return fetch(url, { credentials: 'same-origin' }).then((resp) => {
    if (resp.ok) return resp.text()
    throw Error('Could not fetch ' + url)
  })
}

function prefetchSplit(tmpl) {
  const pr = tmpl.props.prerender
  const res = pr && pr.split('#', 2)

  return {
    file: pr && res[0],
    id: pr && res[1]
  }
}

function prefetchRender(tmpls, baseUrl, cacheEl) {
  const files = tmpls.reduce((res, tmpl) => {
    const file = prefetchSplit(tmpl).file

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

    return files.filter((file, i) => !!svgs[i])
  })
}
