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

import { Box2Abs, Fragment, StereoFlag } from 'domain/entities';

import { LayerMap } from './generalEnumTypes';
import ReObject from './reobject';
import ReStruct from './restruct';
import { Render } from '../raphaelRender';
import { Scale } from 'domain/helpers';

class ReEnhancedFlag extends ReObject {
  #path: any;

  constructor() {
    super('enhancedFlag');
  }

  static isSelectable() {
    return true;
  }

  hoverPath(render: Render): any {
    const box = Box2Abs.fromRelBox(this.#path.getBBox());
    const sz = box.p1.sub(box.p0);
    const p0 = box.p0.sub(render.options.offset);
    return render.paper.rect(p0.x, p0.y, sz.x, sz.y);
  }

  drawHover(render: Render): any {
    // TODO: after the enhanced flag stops being displayed, need to remove the reEnhancedflag object from ctab
    if (!this.#path?.attrs) return null;
    const ret = this.hoverPath(render).attr(render.options.hoverStyle);
    render.ctab.addReObjectPath(LayerMap.hovering, this.visel, ret);
    return ret;
  }

  makeSelectionPlate(restruct: ReStruct, _paper: any, options: any): any {
    // TODO: after the enhanced flag stops being displayed, need to remove the reEnhancedflag object from ctab
    if (!this.#path?.attrs) return null;
    return this.hoverPath(restruct.render).attr(options.selectionStyle);
  }

  show(restruct: ReStruct, fragmentId: number, options: any): void {
    const render = restruct.render;
    const fragment = restruct.molecule.frags.get(fragmentId);
    if (!fragment?.enhancedStereoFlag) return;

    const position = fragment.stereoFlagPosition
      ? fragment.stereoFlagPosition
      : Fragment.getDefaultStereoFlagPosition(restruct.molecule, fragmentId)!;

    const paper = render.paper;
    const ps = Scale.obj2scaled(position, options);

    const stereoFlagMap = {
      [StereoFlag.Abs]: options.absFlagLabel,
      [StereoFlag.And]: options.andFlagLabel,
      [StereoFlag.Mixed]: options.mixedFlagLabel,
      [StereoFlag.Or]: options.orFlagLabel,
    };

    if (options.showStereoFlags && !options.ignoreChiralFlag) {
      this.#path = paper
        .text(
          ps.x,
          ps.y,
          fragment.enhancedStereoFlag
            ? stereoFlagMap[fragment.enhancedStereoFlag]
            : '',
        )
        .attr({
          font: options.font,
          'font-size': options.fontsz,
          fill: '#000',
        });
    }
    render.ctab.addReObjectPath(
      LayerMap.data,
      this.visel,
      this.#path,
      null,
      true,
    );
  }
}

export default ReEnhancedFlag;
