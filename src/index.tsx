import React, { useEffect, useRef } from 'react'
import init from './script'
import './index.less'

interface EditorProps {
  staticResourcesUrl: string
}

export default function Editor({ staticResourcesUrl }: EditorProps) {
  const rootElRef = useRef(null)
  useEffect(() => {
    init(rootElRef.current, staticResourcesUrl)
  }, [])

  return <div ref={rootElRef} className="ketcher root"></div>
}
