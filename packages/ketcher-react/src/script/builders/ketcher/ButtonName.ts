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

export type ButtonName =
  // top
  | 'layout'
  | 'clean'
  | 'arom'
  | 'dearom'
  | 'cip'
  | 'check'
  | 'analyse'
  | 'recognize'
  | 'miew'
  | 'settings'
  | 'help'
  | 'about'
  // left
  // sgroup group
  | 'sgroup'
  | 'sgroup-data'
  // reaction
  // plus
  | 'reaction-plus'
  // arrows
  | 'arrows'
  | 'reaction-arrow-open-angle'
  | 'reaction-arrow-filled-triangle'
  | 'reaction-arrow-filled-bow'
  | 'reaction-arrow-dashed-open-angle'
  | 'reaction-arrow-failed'
  | 'reaction-arrow-both-ends-filled-triangle'
  | 'reaction-arrow-equilibrium-filled-half-bow'
  | 'reaction-arrow-equilibrium-filled-triangle'
  | 'reaction-arrow-equilibrium-open-angle'
  | 'reaction-arrow-unbalanced-equilibrium-filled-half-bow'
  | 'reaction-arrow-unbalanced-equilibrium-open-half-angle'
  | 'reaction-arrow-unbalanced-equilibrium-large-filled-half-bow'
  | 'reaction-arrow-unbalanced-equilibrium-filled-half-triangle'
  | 'reaction-arrow-elliptical-arc-arrow-filled-bow'
  | 'reaction-arrow-elliptical-arc-arrow-filled-triangle'
  | 'reaction-arrow-elliptical-arc-arrow-open-angle'
  | 'reaction-arrow-elliptical-arc-arrow-open-half-angle'
  // mapping
  | 'reaction-mapping-tools'
  | 'reaction-automap'
  | 'reaction-map'
  | 'reaction-unmap'
  // rgroup group
  | 'rgroup'
  | 'rgroup-label'
  | 'rgroup-fragment'
  | 'rgroup-attpoints'
  // shape group
  | 'shape'
  | 'shape-ellipse'
  | 'shape-rectangle'
  | 'shape-line'
  // text group
  | 'text'
  // right
  | 'enhanced-stereo'
  // fullscreen
  | 'fullscreen'
