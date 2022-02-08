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
import { AnalyzingFile } from './AnalyzingFile'

import { OpenOptions } from './OpenOptions'
import { TextEditor } from './TextEditor'

// type ViewStates = {
//   idle: string
//   textEditor: string
// }

// type SwitchProps = {
//   currentState: string
//   states: ViewStates
//   isAnalyzingFile: boolean
// } & OpenOptionsProps &
//   TextEditorProps &
//   AnalyzingFileProps

export const ViewSwitcher = (props) => {
  if (props.isAnalyzingFile) {
    return <AnalyzingFile fileName={props.fileName} />
  } else {
    switch (props.currentState) {
      case props.states.idle:
        return <OpenOptions {...props} />
      case props.states.textEditor:
        return <TextEditor {...props} />
      default:
        return null
    }
  }
}
