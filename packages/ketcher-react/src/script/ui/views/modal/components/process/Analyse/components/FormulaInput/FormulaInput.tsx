/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import type { KeyboardEvent, ReactNode } from 'react';
import styles from './FormulaInput.module.less';

const formulaRegexp = /\b(\d*)([A-Z][a-z]{0,3}#?)(\d*)\s*\b/g;
const errorRegexp = /error:.*/g;

interface FormulaInputMarkdownProperties {
  content: ReactNode;
  contentEditable: boolean;
}

interface FormulaInputProperties {
  value: string;
  contentEditable: boolean;
}

function formulaInputMarkdown(contentData: FormulaInputMarkdownProperties) {
  const { content, contentEditable } = contentData;
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.keyCode === 8) {
      event.preventDefault();
    }
  };
  return (
    <div
      className={styles.chem_input}
      onKeyPress={(event) => event.preventDefault()}
      onPaste={(event) => event.preventDefault()}
      onKeyDown={onKeyDown}
      contentEditable={contentEditable}
      suppressContentEditableWarning={true}
    >
      {content}
    </div>
  );
}

function FormulaInput({ value, contentEditable }: FormulaInputProperties) {
  if (errorRegexp.test(value)) {
    return formulaInputMarkdown({ content: value, contentEditable });
  }

  const content: ReactNode[] = [];
  let cnd: RegExpExecArray | null = formulaRegexp.exec(value);
  let pos = 0;

  while (cnd !== null) {
    if (cnd[1].length > 0) {
      content.push(<sup key={content.length}>{cnd[1]}</sup>);
    }
    content.push(value.substring(pos, cnd.index) + cnd[2]);
    if (cnd[3].length > 0) {
      content.push(<sub key={content.length}>{cnd[3]}</sub>);
    }
    pos = cnd.index + cnd[0].length;
    cnd = formulaRegexp.exec(value);
  }

  if (pos === 0) {
    content.push(value);
  } else {
    content.push(value.substring(pos, value.length));
  }

  return formulaInputMarkdown({ content, contentEditable });
}

export default FormulaInput;
