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

import ClipArea from '../../../../../../component/cliparea/cliparea'
import classes from '../Open.module.less'

export type TextEditorProps = {
  structStr: string
  inputHandler: (str: string) => void
}

export const TextEditor = ({ structStr, inputHandler }: TextEditorProps) => {
  return (
    <>
      <textarea
        className={classes.textareaEditor}
        value={structStr}
        onChange={(event) => inputHandler(event.target.value)}
      />
      <ClipArea
        focused={() => true}
        onCopy={() => ({ 'text/plain': structStr })}
      />
    </>
  )
}
