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

import { LayerMap } from './generalEnumTypes';
import ReObject from './reobject';
import ReStruct from './restruct';
import { Render } from '../raphaelRender';
import { Scale } from 'domain/helpers';
import { SGroup } from 'domain/entities/sgroup';

class ReDataSGroupData extends ReObject {
  public sgroup: SGroup;

  constructor(sgroup: SGroup) {
    super('sgroupData');
    this.sgroup = sgroup;
  }

  static isSelectable(): boolean {
    return true;
  }

  hoverPath(render: Render) {
    const box = this.sgroup.dataArea;
    const p0 = Scale.modelToCanvas(box.p0, render.options);
    const sz = Scale.modelToCanvas(box.p1, render.options).sub(p0);
    return render.paper.rect(p0.x, p0.y, sz.x, sz.y);
  }

  drawHover(render: Render) {
    const ret = this.hoverPath(render).attr(render.options.hoverStyle);
    render.ctab.addReObjectPath(LayerMap.hovering, this.visel, ret);
    return ret;
  }

  makeSelectionPlate(
    restruct: ReStruct,
    _paper: unknown,
    styles: { selectionStyle: Record<string, unknown> },
  ) {
    return this.hoverPath(restruct.render).attr(styles.selectionStyle);
  }
}

export default ReDataSGroupData;
