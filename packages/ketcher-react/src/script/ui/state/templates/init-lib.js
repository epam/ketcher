import { storage } from '../../storage-ext'
import { SdfSerializer, MolSerializer } from 'ketcher-core'
import { appUpdate } from '../options'

export function initLib(lib) {
  return {
    type: 'TMPL_INIT',
    data: { lib }
  }
}

export default function initTmplLib(dispatch, baseUrl, cacheEl) {
  const sdfSerializer = new SdfSerializer()
  prefetchStatic(`${baseUrl}/templates/library.sdf`)
    .then(text => {
      const tmpls = sdfSerializer.deserialize(text)
      const prefetch = prefetchRender(tmpls, baseUrl + '/templates/', cacheEl)

      return prefetch.then(cachedFiles =>
        tmpls.map(tmpl => {
          const pr = prefetchSplit(tmpl)
          if (pr.file)
            tmpl.props.prerender =
              cachedFiles.indexOf(pr.file) !== -1 ? `#${pr.id}` : ''

          return tmpl
        })
      )
    })
    .then(res => {
      const lib = res.concat(userTmpls())
      dispatch(initLib(lib))
      dispatch(appUpdate({ templates: true }))
    })
}

function userTmpls() {
  const userLib = storage.getItem('ketcher-tmpls')
  if (!Array.isArray(userLib) || userLib.length === 0) return []
  const molSerializer = new MolSerializer()
  return userLib
    .map(tmpl => {
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
    .filter(tmpl => tmpl !== null)
}

function prefetchStatic(url) {
  return fetch(url, { credentials: 'same-origin' }).then(resp => {
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
    files.map(fn => prefetchStatic(baseUrl + fn).catch(() => null))
  )

  return fetch.then(svgs => {
    svgs.forEach(svgContent => {
      if (svgContent) cacheEl.innerHTML += svgContent
    })

    return files.filter((file, i) => !!svgs[i])
  })
}
