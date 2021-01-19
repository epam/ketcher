import 'regenerator-runtime/runtime'
import 'whatwg-fetch'
import React, { useEffect, useRef } from 'react'
import 'element-closest-polyfill'
import 'url-search-params-polyfill'
import init from './script'
import './index.less'
import {
  RemoteStructServiceProvider,
  StructServiceProvider
} from './infrastructure/services'

interface EditorProps {
  staticResourcesUrl: string
  structServiceProvider: StructServiceProvider
  apiPath?: string
}

export function Editor({
  staticResourcesUrl,
  apiPath,
  structServiceProvider
}: EditorProps) {
  const rootElRef = useRef(null)
  useEffect(() => {
    init(rootElRef.current, staticResourcesUrl, apiPath, structServiceProvider)
  }, [])

  return <div ref={rootElRef} className="ketcher root"></div>
}

export { RemoteStructServiceProvider }
