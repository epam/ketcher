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

import { GroupDescriptor } from '../../ToolbarGroupItem/ToolbarMultiToolItem/variants/variants.types'
import { ToolbarItem } from '../../toolbar.types'
import { makeItems } from '../../ToolbarGroupItem/utils'

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
const bondSpecial: ToolbarItem[] = makeItems(['bond-dative', 'bond-hydrogen'])

const groups = [bondCommon, bondStereo, bondQuery, bondSpecial]
const groupOptions = groups.flat()
const groupDescriptors = groups.reduce((accum, group, index) => {
  const start = accum[index - 1]?.end || 0

  accum.push({
    start,
    end: start + group.length
  })

  return accum
}, [] as GroupDescriptor[])

export {
  bondCommon,
  bondStereo,
  bondQuery,
  bondSpecial,
  groupOptions,
  groupDescriptors
}
