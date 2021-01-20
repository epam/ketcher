import 'regenerator-runtime/runtime'
import 'whatwg-fetch'
import React, { useEffect, useRef } from 'react'
import 'element-closest-polyfill'
import 'url-search-params-polyfill'
import init, { Config } from './script'
import './index.less'

interface EditorProps extends Config {}

export function Editor(props: EditorProps) {
  const rootElRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    init({
      ...props,
      element: rootElRef.current
    })
  }, [])

  return <div ref={rootElRef} className="ketcher root"></div>
}
