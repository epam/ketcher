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

import React, { Component, createRef } from 'react'

import { Struct } from 'ketcher-core'
import molfile from '../../chem/molfile'
import Render from '../../render'

function renderStruct(el, struct, options = {}) {
  if (el) {
    if (struct?.prerender) {
      // Should it sit here?
      el.innerHTML = struct.prerender
    } else if (struct) {
      console.info('render!', el.clientWidth, el.clientWidth)
      const rnd = new Render(el, {
        autoScale: true,
        ...options
      })
      rnd.setMolecule(struct)
      rnd.update()
      // console.info('render!');//, el.innerHTML);
      // struct.prerender = el.innerHTML;
    }
  }
}

class StructRender extends Component {
  constructor(props) {
    super(props)
    this.tagRef = createRef()
  }

  shouldComponentUpdate() {
    return false
  }

  componentDidMount() {
    const el = this.tagRef.current
    const { struct, options } = this.props
    let parsedStruct
    if (!(struct instanceof Struct)) {
      try {
        parsedStruct = molfile.parse(struct)
      } catch (e) {
        //TODO: add error handler call
        //legacy message: Could not parse structure
        parsedStruct = null
      }
    }
    renderStruct(el, parsedStruct, options)
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
