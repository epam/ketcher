import React, { useEffect, useRef } from 'react'
import init from './script'
import './index.less'

interface EditorProps {
  staticResourcesUrl: string
  apiPath?: string
}

export default function Editor({ staticResourcesUrl, apiPath }: EditorProps) {
  const rootElRef = useRef(null)
  useEffect(() => {
    init(rootElRef.current, staticResourcesUrl, apiPath)
  }, [])

  return <div ref={rootElRef} className="ketcher root"></div>
}
