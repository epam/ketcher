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
import { Atom } from 'domain/entities/CoreAtom';

export class AtomAddOperation implements Operation {
  public atom: Atom;
  constructor(
    public addAtomChangeModel: (atom?: Atom) => Atom,
    public deleteAtomChangeModel: () => void,
  ) {
    this.atom = this.addAtomChangeModel();
  }

  public execute(renderersManager: RenderersManager) {
    this.atom = this.addAtomChangeModel(this.atom);
    renderersManager.addAtom(this.atom);
  }

  public invert(renderersManager: RenderersManager) {
    if (this.atom) {
      this.deleteAtomChangeModel();
      renderersManager.deleteAtom(this.atom);
    }
  }
}

export class AtomDeleteOperation implements Operation {
  constructor(
    public atom: Atom,
    public deleteAtomChangeModel: () => void,
    public addAtomChangeModel: (atom?: Atom) => Atom,
  ) {}

  public execute(renderersManager: RenderersManager) {
    this.deleteAtomChangeModel();
    renderersManager.deleteAtom(this.atom);
  }

  public invert(renderersManager: RenderersManager) {
    this.addAtomChangeModel(this.atom);
    renderersManager.addAtom(this.atom);
  }
}
