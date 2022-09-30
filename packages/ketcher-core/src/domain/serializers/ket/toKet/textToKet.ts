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
import { getNodeWithInvertedYCoord } from '../helpers'
import * as utf8 from 'utf8'

export function textToKet(textNode) {
  return {
    type: 'text',
    data: getNodeWithInvertedYCoord(textToUtf8(textNode.data))
  }
}

function textToUtf8(data) {
  const content = JSON.parse(data.content)
  content.blocks.map ( block => {
    block.text = utf8.encode(block.text);
    console.log(utf8)
    //block.text = "9999999"
    return block
  })
  data.content = JSON.stringify(content)
  return data
}
