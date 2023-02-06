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

import { RxnArrowMode, SimpleObjectMode, findStereoAtoms } from 'ketcher-core'

import { bond as bondSchema } from '../data/schema/struct-schema'
import isHidden from './isHidden'
import { toBondType } from '../data/convert/structconv'
import { isFlipDisabled } from './flips'

const toolActions = {
  hand: {
    title: 'Hand tool',
    shortcut: 'Mod+Alt+h',
    action: { tool: 'hand' },
    hidden: (options) => isHidden(options, 'hand')
  },
  'select-lasso': {
    title: 'Lasso Selection',
    shortcut: 'Escape',
    action: { tool: 'select', opts: 'lasso' }
  },
  'select-rectangle': {
    title: 'Rectangle Selection',
    shortcut: 'Escape',
    action: { tool: 'select', opts: 'rectangle' },
    hidden: (options) => isHidden(options, 'select-rectangle')
  },
  'select-fragment': {
    title: 'Fragment Selection',
    shortcut: 'Escape',
    action: { tool: 'select', opts: 'fragment' },
    hidden: (options) => isHidden(options, 'select-fragment')
  },
  erase: {
    title: 'Erase',
    shortcut: ['Delete', 'Backspace'],
    action: { tool: 'eraser', opts: 1 }, // TODO last selector mode is better
    hidden: (options) => isHidden(options, 'erase')
  },
  chain: {
    title: 'Chain',
    action: { tool: 'chain' },
    hidden: (options) => isHidden(options, 'chain')
  },
  'enhanced-stereo': {
    shortcut: 'Alt+e',
    title: 'Stereochemistry',
    action: { tool: 'enhancedStereo' },
    disabled: (editor) =>
      findStereoAtoms(
        editor?.struct(),
        Array.from(editor?.struct().atoms.keys())
      ).length === 0,
    hidden: (options) => isHidden(options, 'enhanced-stereo')
  },
  'charge-plus': {
    shortcut: '5',
    title: 'Charge Plus',
    action: { tool: 'charge', opts: 1 },
    hidden: (options) => isHidden(options, 'charge-plus')
  },
  'charge-minus': {
    shortcut: '5',
    title: 'Charge Minus',
    action: { tool: 'charge', opts: -1 },
    hidden: (options) => isHidden(options, 'charge-minus')
  },
  transforms: {
    hidden: (options) => isHidden(options, 'transforms')
  },
  'transform-rotate': {
    shortcut: 'Alt+r',
    title: 'Rotate Tool',
    action: { tool: 'rotate' },
    hidden: (options) => isHidden(options, 'transform-rotate')
  },
  'transform-flip-h': {
    shortcut: 'Alt+h',
    title: 'Horizontal Flip',
    action: { tool: 'rotate', opts: 'horizontal' },
    disabled: isFlipDisabled,
    hidden: (options) => isHidden(options, 'transform-flip-h')
  },
  'transform-flip-v': {
    shortcut: 'Alt+v',
    title: 'Vertical Flip',
    action: { tool: 'rotate', opts: 'vertical' },
    disabled: isFlipDisabled,
    hidden: (options) => isHidden(options, 'transform-flip-v')
  },
  sgroup: {
    shortcut: 'Mod+g',
    title: 'S-Group',
    action: { tool: 'sgroup' },
    hidden: (options) => isHidden(options, 'sgroup')
  },
  'sgroup-data': {
    shortcut: 'Mod+g',
    title: 'Data S-Group',
    action: { tool: 'sgroup', opts: 'DAT' },
    hidden: (options) => isHidden(options, 'sgroup-data')
  },
  arrows: {
    hidden: (options) => isHidden(options, 'arrows')
  },
  'reaction-arrow-open-angle': {
    title: 'Arrow Open Angle Tool',
    action: { tool: 'reactionarrow', opts: RxnArrowMode.OpenAngle },
    hidden: (options) => isHidden(options, 'reaction-arrow-open-angle')
  },
  'reaction-arrow-filled-triangle': {
    title: 'Arrow Filled Triangle',
    action: { tool: 'reactionarrow', opts: RxnArrowMode.FilledTriangle },
    hidden: (options) => isHidden(options, 'reaction-arrow-filled-triangle')
  },
  'reaction-arrow-filled-bow': {
    title: 'Arrow Filled Bow Tool',
    action: { tool: 'reactionarrow', opts: RxnArrowMode.FilledBow },
    hidden: (options) => isHidden(options, 'reaction-arrow-filled-bow')
  },
  'reaction-arrow-dashed-open-angle': {
    title: 'Arrow Dashed Open Angle Tool',
    action: { tool: 'reactionarrow', opts: RxnArrowMode.DashedOpenAngle },
    hidden: (options) => isHidden(options, 'reaction-arrow-dashed-open-angle')
  },
  'reaction-arrow-failed': {
    title: 'Failed Arrow Tool',
    action: { tool: 'reactionarrow', opts: RxnArrowMode.Failed },
    hidden: (options) => isHidden(options, 'reaction-arrow-failed')
  },
  'reaction-arrow-both-ends-filled-triangle': {
    title: 'Arrow Both Ends Filled Triangle Tool',
    action: {
      tool: 'reactionarrow',
      opts: RxnArrowMode.BothEndsFilledTriangle
    },
    hidden: (options) =>
      isHidden(options, 'reaction-arrow-both-ends-filled-triangle')
  },
  'reaction-arrow-equilibrium-filled-half-bow': {
    title: 'Arrow Equilibrium Filled Half Bow Tool',
    action: {
      tool: 'reactionarrow',
      opts: RxnArrowMode.EquilibriumFilledHalfBow
    },
    hidden: (options) =>
      isHidden(options, 'reaction-arrow-equilibrium-filled-half-bow')
  },
  'reaction-arrow-equilibrium-filled-triangle': {
    title: 'Arrow Equilibrium Filled Triangle Tool',
    action: {
      tool: 'reactionarrow',
      opts: RxnArrowMode.EquilibriumFilledTriangle
    },
    hidden: (options) =>
      isHidden(options, 'reaction-arrow-equilibrium-filled-triangle')
  },
  'reaction-arrow-equilibrium-open-angle': {
    title: 'Arrow Equilibrium Open Angle Tool',
    action: { tool: 'reactionarrow', opts: RxnArrowMode.EquilibriumOpenAngle },
    hidden: (options) =>
      isHidden(options, 'reaction-arrow-equilibrium-open-angle')
  },
  'reaction-arrow-unbalanced-equilibrium-filled-half-bow': {
    title: 'Arrow Unbalanced Equilibrium Filled Half Bow Tool',
    action: {
      tool: 'reactionarrow',
      opts: RxnArrowMode.UnbalancedEquilibriumFilledHalfBow
    },
    hidden: (options) =>
      isHidden(options, 'reaction-arrow-unbalanced-equilibrium-filled-half-bow')
  },
  'reaction-arrow-unbalanced-equilibrium-open-half-angle': {
    title: 'Arrow Unbalanced Equilibrium Open Half Angle Tool',
    action: {
      tool: 'reactionarrow',
      opts: RxnArrowMode.UnbalancedEquilibriumOpenHalfAngle
    },
    hidden: (options) =>
      isHidden(options, 'reaction-arrow-unbalanced-equilibrium-open-half-angle')
  },
  'reaction-arrow-unbalanced-equilibrium-large-filled-half-bow': {
    title: 'Arrow Unbalanced Equilibrium Large Filled Half Bow Tool',
    action: {
      tool: 'reactionarrow',
      opts: RxnArrowMode.UnbalancedEquilibriumLargeFilledHalfBow
    },
    hidden: (options) =>
      isHidden(
        options,
        'reaction-arrow-unbalanced-equilibrium-large-filled-half-bow'
      )
  },
  'reaction-arrow-unbalanced-equilibrium-filled-half-triangle': {
    title: 'Arrow Unbalanced Equilibrium Filled Half Triangle Tool',
    action: {
      tool: 'reactionarrow',
      opts: RxnArrowMode.UnbalancedEquilibriumFilledHalfTriangle
    },
    hidden: (options) =>
      isHidden(
        options,
        'reaction-arrow-unbalanced-equilibrium-filled-half-triangle'
      )
  },
  'reaction-arrow-elliptical-arc-arrow-filled-bow': {
    title: 'Arrow Elliptical Arc Filled Bow Tool',
    action: {
      tool: 'reactionarrow',
      opts: RxnArrowMode.EllipticalArcFilledBow
    },
    hidden: (options) =>
      isHidden(options, 'reaction-arrow-elliptical-arc-arrow-filled-bow')
  },
  'reaction-arrow-elliptical-arc-arrow-filled-triangle': {
    title: 'Arrow Elliptical Arc Filled Triangle Tool',
    action: {
      tool: 'reactionarrow',
      opts: RxnArrowMode.EllipticalArcFilledTriangle
    },
    hidden: (options) =>
      isHidden(options, 'reaction-arrow-elliptical-arc-arrow-filled-triangle')
  },
  'reaction-arrow-elliptical-arc-arrow-open-angle': {
    title: 'Arrow Elliptical Arc Open Angle Tool',
    action: {
      tool: 'reactionarrow',
      opts: RxnArrowMode.EllipticalArcOpenAngle
    },
    hidden: (options) =>
      isHidden(options, 'reaction-arrow-elliptical-arc-arrow-open-angle')
  },
  'reaction-arrow-elliptical-arc-arrow-open-half-angle': {
    title: 'Arrow Elliptical Arc Open Half Angle Tool',
    action: {
      tool: 'reactionarrow',
      opts: RxnArrowMode.EllipticalArcOpenHalfAngle
    },
    hidden: (options) =>
      isHidden(options, 'reaction-arrow-elliptical-arc-arrow-open-half-angle')
  },
  'reaction-plus': {
    title: 'Reaction Plus Tool',
    action: { tool: 'reactionplus' },
    hidden: (options) => isHidden(options, 'reaction-plus')
  },
  'reaction-mapping-tools': {
    hidden: (options) => isHidden(options, 'reaction-mapping-tools')
  },
  'reaction-map': {
    title: 'Reaction Mapping Tool',
    action: { tool: 'reactionmap' },
    hidden: (options) => isHidden(options, 'reaction-map')
  },
  'reaction-unmap': {
    title: 'Reaction Unmapping Tool',
    action: { tool: 'reactionunmap' },
    hidden: (options) => isHidden(options, 'reaction-unmap')
  },
  rgroup: {
    hidden: (options) => isHidden(options, 'rgroup')
  },
  'rgroup-label': {
    shortcut: 'Mod+r',
    title: 'R-Group Label Tool',
    action: { tool: 'rgroupatom' },
    hidden: (options) => isHidden(options, 'rgroup-label')
  },
  'rgroup-fragment': {
    shortcut: ['Mod+Shift+r', 'Mod+r'],
    title: 'R-Group Fragment Tool',
    action: { tool: 'rgroupfragment' },
    hidden: (options) => isHidden(options, 'rgroup-fragment')
  },
  'rgroup-attpoints': {
    shortcut: 'Mod+r',
    title: 'Attachment Point Tool',
    action: { tool: 'apoint' },
    hidden: (options) => isHidden(options, 'rgroup-attpoints')
  },
  shapes: {
    hidden: (options) => isHidden(options, 'shapes')
  },
  'shape-ellipse': {
    title: 'Shape Ellipse',
    action: { tool: 'simpleobject', opts: SimpleObjectMode.ellipse },
    hidden: (options) => isHidden(options, 'shape-ellipse')
  },
  'shape-rectangle': {
    title: 'Shape Rectangle',
    action: { tool: 'simpleobject', opts: SimpleObjectMode.rectangle },
    hidden: (options) => isHidden(options, 'shape-rectangle')
  },
  'shape-line': {
    title: 'Shape Line',
    action: { tool: 'simpleobject', opts: SimpleObjectMode.line },
    hidden: (options) => isHidden(options, 'shape-line')
  },
  text: {
    title: 'Add text',
    action: { tool: 'text' },
    hidden: (options) => isHidden(options, 'text')
  },
  bonds: {
    hidden: (options) => isHidden(options, 'bonds')
  }
}

const bondCuts = {
  single: '1',
  double: '2',
  triple: '3',
  up: '1',
  down: '1',
  updown: '1',
  crossed: '2',
  any: '0',
  aromatic: '4'
}

const typeSchema = bondSchema.properties.type

export default typeSchema.enum.reduce((res, type, i) => {
  res[`bond-${type}`] = {
    title: `${typeSchema.enumNames[i]} Bond`,
    shortcut: bondCuts[type],
    action: {
      tool: 'bond',
      opts: toBondType(type)
    },
    hidden: (options) => isHidden(options, `bond-${type}`)
  }
  return res
}, toolActions)
