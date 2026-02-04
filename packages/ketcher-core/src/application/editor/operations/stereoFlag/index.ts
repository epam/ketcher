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

import { RenderersManager } from 'application/render/renderers/RenderersManager';
import { Operation } from 'domain/entities/Operation';
import { CoreStereoFlag } from 'domain/entities/CoreStereoFlag';

export class StereoFlagAddOperation implements Operation {
  public stereoFlag: CoreStereoFlag;
  public priority = 2;

  constructor(
    public addStereoFlagChangeModel: (
      stereoFlag?: CoreStereoFlag,
    ) => CoreStereoFlag,
    public deleteStereoFlagChangeModel: (stereoFlag: CoreStereoFlag) => void,
  ) {
    this.stereoFlag = this.addStereoFlagChangeModel();
  }

  public execute(renderersManager: RenderersManager) {
    this.stereoFlag = this.addStereoFlagChangeModel(this.stereoFlag);
    renderersManager.addStereoFlag(this.stereoFlag);
  }

  public invert(renderersManager: RenderersManager) {
    if (this.stereoFlag) {
      this.deleteStereoFlagChangeModel(this.stereoFlag);
      renderersManager.deleteStereoFlag(this.stereoFlag);
    }
  }
}

export class StereoFlagDeleteOperation implements Operation {
  public priority = 2;

  constructor(
    public stereoFlag: CoreStereoFlag,
    public deleteStereoFlagChangeModel: (stereoFlag: CoreStereoFlag) => void,
    public addStereoFlagChangeModel: (
      stereoFlag: CoreStereoFlag,
    ) => CoreStereoFlag,
  ) {}

  public execute(renderersManager: RenderersManager) {
    this.deleteStereoFlagChangeModel(this.stereoFlag);
    renderersManager.deleteStereoFlag(this.stereoFlag);
  }

  public invert(renderersManager: RenderersManager) {
    this.addStereoFlagChangeModel(this.stereoFlag);
    renderersManager.addStereoFlag(this.stereoFlag);
  }
}
