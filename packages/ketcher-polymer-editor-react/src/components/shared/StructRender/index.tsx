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
import { Render } from 'ketcher-core'
import { useEffect, useRef } from 'react'
import { renderOptions } from './consts'
import { Container } from './styles'
import { IStructRender } from './types'
import { prepareStruct } from './utils'

export const StructRender = ({ struct, className }: IStructRender) => {
  const renderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (renderRef.current) {
      const preparedStruct = prepareStruct(struct)
      preparedStruct.initHalfBonds()
      preparedStruct.initNeighbors()
      preparedStruct.setImplicitHydrogen()
      preparedStruct.markFragments()
      renderRef.current.innerHTML = ''
      const rnd = new Render(renderRef.current, renderOptions)
      rnd.setMolecule(preparedStruct)
      rnd.update(true)
    }
  }, [struct])

  return <Container ref={renderRef} className={className}></Container>
}
