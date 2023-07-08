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
import { LayerMap } from './generalEnumTypes';
import ReObject from './reobject';
import { Scale } from 'domain/helpers';
import draw from '../draw';
import util from '../util';

class ReRxnPlus extends ReObject {
  constructor(/* chem.RxnPlus */ plus) {
    super('rxnPlus');
    this.item = plus;
  }

  static isSelectable() {
    return true;
  }

  hoverPath(render) {
    const p = Scale.obj2scaled(this.item.pp, render.options);
    const s = render.options.scale;
    /* eslint-disable no-mixed-operators */
    return render.paper.rect(p.x - s / 4, p.y - s / 4, s / 2, s / 2, s / 8);
    /* eslint-enable no-mixed-operators */
  }

  drawHover(render) {
    const ret = this.hoverPath(render).attr(render.options.hoverStyle);
    render.ctab.addReObjectPath(LayerMap.hovering, this.visel, ret);
    return ret;
  }

  makeSelectionPlate(restruct, paper, styles) {
    // TODO [MK] review parameters
    return this.hoverPath(restruct.render).attr(styles.selectionStyle);
  }

  show(restruct, id, options) {
    const render = restruct.render;
    const centre = Scale.obj2scaled(this.item.pp, options);
    const path = draw.plus(render.paper, centre, options);
    const offset = options.offset;
    if (offset != null) path.translateAbs(offset.x, offset.y);
    this.visel.add(path, Box2Abs.fromRelBox(util.relBox(path.getBBox())));
  }
}

export default ReRxnPlus;
