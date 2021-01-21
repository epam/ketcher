import 'element-closest-polyfill'
import React, { useEffect, useRef } from 'react'
import 'regenerator-runtime/runtime'
import 'url-search-params-polyfill'
import 'whatwg-fetch'
import './index.less'
import { RemoteStructServiceProvider } from './infrastructure/services'
import init, { Config } from './script'

interface EditorProps extends Config {}

function Editor(props: EditorProps) {
  const rootElRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    init({
      ...props,
      element: rootElRef.current
    })
  }, [])

  return <div ref={rootElRef} className="ketcher root"></div>
}

export { Editor, RemoteStructServiceProvider }
