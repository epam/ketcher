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
import { Tool } from 'application/editor/tools/Tool';
import { Vec2 } from 'domain/entities';
import { PeptideRenderer } from 'application/render/renderers/PeptideRenderer';
import { CoreEditor } from 'application/editor';

class SelectLasso implements Tool {
  private isMouseDown = false;
  private selectedItem?: PeptideRenderer;

  constructor(private editor: CoreEditor) {
    this.editor = editor;
  }

  mousedown(event) {
    this.isMouseDown = true;
    this.selectedItem = event.target.__data__;
  }

  mousemove(event) {
    if (this.isMouseDown && this.selectedItem) {
      if (this.selectedItem instanceof PeptideRenderer) {
        this.selectedItem.monomer.moveRelative(
          new Vec2(event.movementX, event.movementY),
        );
        if (this.selectedItem.monomer.hasBonds) {
          this.selectedItem.monomer.forEachBond((bond) => {
            bond.moveToLinkedMonomers();
          });
        }
        this.selectedItem.move();
      }
      this.editor.renderersContainer.update(false);
    }
  }

  mouseup() {
    this.isMouseDown = false;
    this.selectedItem = undefined;
  }
}

export { SelectLasso };
