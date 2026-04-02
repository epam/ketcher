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

import { RenderersManagerBase } from 'application/render/renderers/RenderersManagerBase';
import { Operation } from 'domain/entities/Operation';
import { CoreEditorBase } from 'application/editor/CoreEditorBase';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';

export class ReinitializeModeOperation implements Operation {
  public priority = 2;

  public execute(_renderersManager: RenderersManagerBase) {
    const editor = CoreEditorBase.provideEditorInstance();

    editor.mode.initialize(false);
  }

  public invert(_renderersManager: RenderersManagerBase) {
    const editor = CoreEditorBase.provideEditorInstance();

    editor.mode.initialize(false);
  }
}

export class RestoreSequenceCaretPositionOperation implements Operation {
  constructor(
    private readonly previousPosition: number,
    private readonly nextPosition: number,
  ) {
    this.execute();
  }

  public execute() {
    SequenceRenderer.setCaretPosition(this.nextPosition);
  }

  public invert(_renderersManager: RenderersManagerBase) {
    SequenceRenderer.setCaretPosition(this.previousPosition);
  }
}
