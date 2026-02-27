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

import { BaseRenderer } from 'application/render';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { Vec2 } from 'domain/entities/vec2';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { StereoFlag as StereoFlagEnum } from 'domain/entities/fragment';
import { StereoFlagRenderer } from 'application/render/renderers/StereoFlagRenderer';

export class CoreStereoFlag extends DrawingEntity {
  public renderer?: StereoFlagRenderer = undefined;

  constructor(
    position: Vec2,
    public flagType: StereoFlagEnum,
    public relatedMonomer: BaseMonomer,
  ) {
    super(position);
  }

  public get center(): Vec2 {
    return this.position;
  }

  public setRenderer(renderer: StereoFlagRenderer): void {
    super.setBaseRenderer(renderer as BaseRenderer);
    this.renderer = renderer;
  }
}
