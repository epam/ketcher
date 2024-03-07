/* eslint-disable @typescript-eslint/no-unused-vars */
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
/* eslint-disable @typescript-eslint/no-use-before-define */

import { RenderersManager } from 'application/render/renderers/RenderersManager';
import { Operation } from 'domain/entities/Operation';
import { CoreEditor } from 'application/editor/internal';
import { SequenceMode } from 'application/editor/modes';
import {
  SequencePointer,
  SequenceRenderer,
} from 'application/render/renderers/sequence/SequenceRenderer';
import assert from 'assert';

export class ReinitializeSequenceModeCommand implements Operation {
  constructor() {}

  public execute(_renderersManager: RenderersManager) {
    const editor = CoreEditor.provideEditorInstance();
    assert(editor.mode instanceof SequenceMode);
    editor.mode.initialize(false, false);
  }

  public invert(_renderersManager: RenderersManager) {
    const editor = CoreEditor.provideEditorInstance();
    assert(editor.mode instanceof SequenceMode);
    editor.mode.initialize(false, false);
  }
}

export class RestoreSequenceCaretPositionCommand implements Operation {
  constructor(
    private previousPosition: SequencePointer,
    private nextPosition: SequencePointer,
  ) {
    this.execute();
  }

  public execute() {
    SequenceRenderer.setCaretPosition(this.nextPosition);
  }

  public invert(_renderersManager: RenderersManager) {
    SequenceRenderer.setCaretPosition(this.previousPosition);
  }
}
