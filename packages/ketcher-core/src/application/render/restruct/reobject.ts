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

import { Box2Abs } from 'domain/entities';
import ReStruct from './restruct';
import { Render } from '../raphaelRender';
import { Scale } from 'domain/helpers';
import Visel from './visel';

class ReObject {
  public visel: Visel;
  public hover = false;
  public hovering: any = null;
  public selected = false;
  public selectionPlate: any = null;

  constructor(viselType: string) {
    this.visel = new Visel(viselType);
  }

  changeSelectionStyle(options: any) {
    const { hoverStyle } = options;
    this.hovering?.attr({
      fill: this.selected ? hoverStyle.fillSelected : hoverStyle.fill,
      'fill-opacity': this.selected ? 1 : 0,
    });
  }

  getVBoxObj(render: Render): Box2Abs | null {
    let vbox = this.visel.boundingBox;
    if (vbox === null) return null;
    if (render.options.offset) {
      vbox = vbox.translate(render.options.offset.negated());
    }
    return vbox.transform(Scale.scaled2obj, render.options);
  }

  setHover(hover: boolean, render: Render): void {
    // TODO render should be field
    const { options } = render;
    if (hover) {
      let noredraw = 'hovering' in this && this.hovering !== null;
      if (noredraw) {
        if (this.hovering.type === 'set') {
          if (!this.hovering[0]) return;
          noredraw = !this.hovering[0].removed;
        } else {
          noredraw = !this.hovering.removed;
        }
      }
      if (noredraw) {
        this.changeSelectionStyle(options);
        this.hovering.show();
      } else {
        render.paper.setStart();
        this.drawHover(render);
        this.hovering = render.paper.setFinish();
      }
    } else if (this.hovering) {
      this.changeSelectionStyle(options);
      this.hovering.hide();
    }

    this.hover = hover;
  }

  drawHover(_render: Render): any {
    throw new Error('ReObject.drawHover is not overridden.');
  }

  makeSelectionPlate(_restruct: ReStruct, _paper: any, _styles: any): any {
    throw new Error('ReObject.makeSelectionPlate is not overridden');
  }
}

export default ReObject;
