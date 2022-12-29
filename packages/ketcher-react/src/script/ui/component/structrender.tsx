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

import { Component, ComponentType, createRef } from 'react'
import { MolSerializer, Struct } from 'ketcher-core'
import { RenderStruct } from '../utils'
interface StructRenderProps {
  struct: Struct
  options: any
  id?: any
  Tag?: string | ComponentType<any>
}

class StructRender extends Component<StructRenderProps> {
  tagRef: React.RefObject<HTMLElement>
  constructor(props) {
    super(props)
    this.tagRef = createRef()
  }

  shouldComponentUpdate(previousProps) {
    return Boolean(this.props.id && this.props.id !== previousProps.id)
  }

  update() {
    const el = this.tagRef.current
    const { struct, options } = this.props
    let parsedStruct: Struct | null
    if (!(struct instanceof Struct)) {
      try {
        const molSerialzer = new MolSerializer()
        parsedStruct = molSerialzer.deserialize(struct)
      } catch (e) {
        // TODO: add error handler call
        // legacy message: Could not parse structure
        parsedStruct = null
      }
    } else {
      parsedStruct = struct
    }
    el?.childNodes.forEach((node) => {
      node.remove()
    })
    RenderStruct.render(el, parsedStruct, options)
  }

  componentDidMount() {
    this.update()
  }

  componentDidUpdate() {
    this.update()
  }

  render() {
    const { struct, Tag = 'div', ...props } = this.props
    return (
      <Tag ref={this.tagRef} /* ref="el" */ {...props}>
        {struct ? null : 'No molecule'}
      </Tag>
    )
  }
}

export default StructRender
