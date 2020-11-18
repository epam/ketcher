import React, { useEffect, useRef } from 'react'
import 'url-search-params-polyfill'
import init from './script'
import './index.less'

interface EditorProps {
  staticResourcesUrl: string
  apiPath?: string
}

export function Editor({ staticResourcesUrl, apiPath }: EditorProps) {
  const rootElRef = useRef(null)
  useEffect(() => {
    init(rootElRef.current, staticResourcesUrl, apiPath)
  }, [])

  return <div ref={rootElRef} className="ketcher root"></div>
}
