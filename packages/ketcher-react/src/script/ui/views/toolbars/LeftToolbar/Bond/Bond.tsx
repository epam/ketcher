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
import React from 'react'
import { useMediaQuery } from 'react-responsive'
import {
  ToolbarGroupItemCallProps,
  ToolbarGroupItemProps
} from '../../ToolbarGroupItem'
import { ToolbarMultiToolItem } from '../../ToolbarGroupItem/ToolbarMultiToolItem'
import { ToolbarItem, ToolbarItemVariant } from '../../toolbox.types'

function makeItems(ids: ToolbarItemVariant[]): ToolbarItem[] {
  return ids.map(id => ({ id }))
}

const bondCommon: ToolbarItem[] = makeItems([
  'bond-single',
  'bond-double',
  'bond-triple'
])
const bondStereo: ToolbarItem[] = makeItems([
  'bond-up',
  'bond-down',
  'bond-updown',
  'bond-crossed'
])
const bondQuery: ToolbarItem[] = makeItems([
  'bond-any',
  'bond-aromatic',
  'bond-singledouble',
  'bond-singlearomatic',
  'bond-doublearomatic'
])

interface BondProps extends Omit<ToolbarGroupItemProps, 'id' | 'options'> {}
interface BondCallProps extends ToolbarGroupItemCallProps {}

type Props = BondProps & BondCallProps

const Bond = (props: Props) => {
  const collapseBond = useMediaQuery({ query: '(max-height: 700px)' })

  if (collapseBond) {
    return (
      <ToolbarMultiToolItem
        id="bond-common"
        options={[...bondCommon, ...bondStereo, ...bondQuery]}
        variant="grouped"
        groups={[bondCommon.length, bondStereo.length, bondQuery.length]}
        {...props}
      />
    )
  }

  return (
    <>
      <ToolbarMultiToolItem id="bond-common" options={bondCommon} {...props} />
      <ToolbarMultiToolItem id="bond-stereo" options={bondStereo} {...props} />
      <ToolbarMultiToolItem id="bond-query" options={bondQuery} {...props} />
    </>
  )
}

export type { BondProps, BondCallProps }
export { Bond }
