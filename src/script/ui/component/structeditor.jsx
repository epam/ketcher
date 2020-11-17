/****************************************************************************
 * Copyright 2020 EPAM Systems
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

import { upperFirst } from 'lodash/fp'
import React, { Component, createRef } from 'react'

import MeasureLog from './measurelog'
import Editor from '../../editor'

function setupEditor(editor, props, oldProps = {}) {
  const { struct, tool, toolOpts, options } = props

  if (struct !== oldProps.struct) editor.struct(struct)

  if (tool !== oldProps.tool || toolOpts !== oldProps.toolOpts)
    editor.tool(tool, toolOpts)

  if (oldProps.options && options !== oldProps.options) editor.options(options)

  // update handlers
  Object.keys(editor.event).forEach(name => {
    const eventName = `on${upperFirst(name)}`

    if (props[eventName] !== oldProps[eventName]) {
      if (oldProps[eventName]) editor.event[name].remove(oldProps[eventName])

      if (props[eventName]) editor.event[name].add(props[eventName])
    }
  })
}

function removeEditorHandlers(editor, props) {
  Object.keys(editor.event).forEach(name => {
    const eventName = `on${upperFirst(name)}`

    if (props[eventName]) editor.event[name].remove(props[eventName])
  })
}

class StructEditor extends Component {
  constructor(props) {
    super(props)
    this.editorRef = createRef()
  }
  shouldComponentUpdate() {
    return false
  }

  componentWillReceiveProps(props) {
    setupEditor(this.instance, props, this.props)
  }

  componentDidMount() {
    this.instance = new Editor(this.editorRef.current, {
      ...this.props.options
    })
    setupEditor(this.instance, this.props)
    if (this.props.handleinit) this.props.handleinit(this.instance)
  }

  componentWillUnmount() {
    removeEditorHandlers(this.instance, this.props)
  }

  render() {
    const {
      Tag = 'div',
      struct,
      tool,
      toolOpts,
      options,
      handleinit,
      handleselectionchange,
      handleelementedit,
      handleenhancedstereoedit,
      handlequickedit,
      handlebondedit,
      handlergroupedit,
      handlesgroupedit,
      handlesdataedit,
      handlemessage,
      handlearomatizestruct,
      handledearomatizestruct,
      ...props
    } = this.props
    return (
      <Tag
        onMouseDown={ev => ev.preventDefault()}
        handleinit={1}
        handleselectionchange={1}
        handleelementedit={1}
        handleenhancedstereoedit={1}
        handlequickedit={1}
        handlebondedit={1}
        handlergroupedit={1}
        handlesgroupedit={1}
        handlesdataedit={1}
        handlemessage={1}
        handlearomatizestruct={1}
        handledearomatizestruct={1}
        {...props}
        ref={this.editorRef}>
        {/* svg here */}
        <MeasureLog />
      </Tag>
    )
  }
}

export default StructEditor
