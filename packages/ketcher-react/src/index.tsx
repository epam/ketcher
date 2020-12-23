import 'regenerator-runtime/runtime'
import 'whatwg-fetch'
import React, { useEffect, useRef } from 'react'
import 'element-closest-polyfill'
import 'url-search-params-polyfill'
import init from './script'
import { StructService } from './infrastructure/services'
import './index.less'

interface EditorProps {
  staticResourcesUrl: string
  apiPath?: string
  structServiceFn?: (baseUrl: string, defaultOptions: any) => StructService
}

export function Editor({
  staticResourcesUrl,
  apiPath,
  structServiceFn
}: EditorProps) {
  const rootElRef = useRef(null)
  useEffect(() => {
    init(rootElRef.current, staticResourcesUrl, apiPath, structServiceFn)
  }, [])

  return <div ref={rootElRef} className="ketcher root"></div>
}
