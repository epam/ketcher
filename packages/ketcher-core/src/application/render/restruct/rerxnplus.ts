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

import { Box2Abs, RxnPlus } from 'domain/entities';
import { LayerMap } from './generalEnumTypes';
import ReObject from './reobject';
import { Scale } from 'domain/helpers';
import draw from '../draw';
import util from '../util';
import { Render } from '../raphaelRender';
import ReStruct from './restruct';
import { RenderOptions } from '../render.types';

class ReRxnPlus extends ReObject {
  item: RxnPlus;

  constructor(plus: RxnPlus) {
    super('rxnPlus');
    this.item = plus;
  }

  static isSelectable(): boolean {
    return true;
  }

  hoverPath(render: Render) {
    const p = Scale.modelToCanvas(this.item.pp, render.options);
    const s = render.options.microModeScale;
    /* eslint-disable no-mixed-operators */
    return render.paper.rect(p.x - s / 4, p.y - s / 4, s / 2, s / 2, s / 8);
    /* eslint-enable no-mixed-operators */
  }

  drawHover(render: Render) {
    const ret = this.hoverPath(render).attr(render.options.hoverStyle);
    render.ctab.addReObjectPath(LayerMap.hovering, this.visel, ret);
    return ret;
  }

  makeSelectionPlate(
    restruct: ReStruct,
    _paper: unknown,
    styles: RenderOptions,
  ) {
    // TODO [MK] review parameters
    return this.hoverPath(restruct.render).attr(styles.selectionStyle);
  }

  show(restruct: ReStruct, _id: number, options: RenderOptions): void {
    const render = restruct.render;
    const centre = Scale.modelToCanvas(this.item.pp, options);
    const path = draw.plus(render.paper, centre, options);
    const offset = options.offset;
    if (offset != null) path.translateAbs(offset.x, offset.y);
    this.visel.add(path, Box2Abs.fromRelBox(util.relBox(path.getBBox())));
    path.node?.setAttribute('data-testid', 'rxn-plus');
  }
}

export default ReRxnPlus;
