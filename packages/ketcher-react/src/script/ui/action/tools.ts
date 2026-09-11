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

import {
  RxnArrowMode,
  SimpleObjectMode,
  findStereoAtoms,
  IMAGE_KEY,
  MULTITAIL_ARROW_TOOL_NAME,
  CREATE_MONOMER_TOOL_NAME,
} from 'ketcher-core';

import { bond as bondSchema } from '../data/schema/struct-schema';
import isHidden from './isHidden';
import { toBondType } from '../data/convert/structconv';
import { isFlipDisabled } from './flips';
import { MONOMER_WIZARD_DISALLOWED_BOND_TYPES } from '../views/components/ContextMenu/utils';
import type { UiAction } from './action.types';

type ToolActionEntry = Omit<UiAction, 'action'> & {
  action?: UiAction['action'];
};

const toolActions: Record<string, ToolActionEntry> = {
  hand: {
    title: 'toolbar:tools.hand',
    enabledInViewOnly: true,
    shortcut: 'Mod+Alt+h',
    action: { tool: 'hand' },
    hidden: (options) => isHidden(options, 'hand'),
  },
  'select-rectangle': {
    title: 'toolbar:tools.selectRectangle',
    enabledInViewOnly: true,
    shortcut: ['Shift+Tab', 'Escape'],
    action: { tool: 'select', opts: 'rectangle' },
    hidden: (options) => isHidden(options, 'select-rectangle'),
  },
  'select-lasso': {
    title: 'toolbar:tools.selectLasso',
    enabledInViewOnly: true,
    shortcut: ['Shift+Tab', 'Escape'],
    action: { tool: 'select', opts: 'lasso' },
  },
  'select-structure': {
    title: 'toolbar:tools.selectStructure',
    shortcut: ['Shift+Tab', 'Escape'],
    action: { tool: 'select', opts: 'structure' },
    hidden: (options) => isHidden(options, 'select-structure'),
  },
  'select-fragment': {
    title: 'toolbar:tools.selectFragment',
    shortcut: ['Shift+Tab', 'Escape'],
    action: { tool: 'fragmentSelection' },
    hidden: (options) => isHidden(options, 'select-fragment'),
  },
  erase: {
    title: 'toolbar:tools.erase',
    shortcut: ['Delete', 'Backspace'],
    action: { tool: 'eraser', opts: 1 }, // TODO last selector mode is better
    hidden: (options) => isHidden(options, 'erase'),
  },
  chain: {
    title: 'toolbar:tools.chain',
    action: { tool: 'chain' },
    hidden: (options) => isHidden(options, 'chain'),
  },
  'enhanced-stereo': {
    shortcut: 'Alt+e',
    title: 'toolbar:tools.stereochemistry',
    action: { tool: 'enhancedStereo' },
    disabled: (editor) => {
      if (editor.isMonomerCreationWizardActive) {
        return true;
      }
      const struct = editor?.struct?.();
      const atomIds =
        editor?.selection?.()?.atoms ?? Array.from(struct.atoms.keys());
      return findStereoAtoms(struct, atomIds).length === 0;
    },
    hidden: (options) => isHidden(options, 'enhanced-stereo'),
  },
  'charge-plus': {
    shortcut: ['Equal', 'Shift+Equal', 'NumpadAdd'],
    title: 'toolbar:tools.chargePlus',
    action: { tool: 'charge', opts: 1 },
    hidden: (options) => isHidden(options, 'charge-plus'),
  },
  'charge-minus': {
    shortcut: ['Minus', 'NumpadSubtract'],
    title: 'toolbar:tools.chargeMinus',
    action: { tool: 'charge', opts: -1 },
    hidden: (options) => isHidden(options, 'charge-minus'),
  },
  'transform-rotate': {
    title: 'toolbar:tools.rotate',
    action: { tool: 'rotate' },
    hidden: (options) => isHidden(options, 'transform-rotate'),
  },
  'transform-flip-h': {
    shortcut: 'Alt+h',
    title: 'toolbar:tools.flipHorizontal',
    action: { tool: 'rotate', opts: 'horizontal' },
    disabled: isFlipDisabled,
    hidden: (options) => isHidden(options, 'transform-flip-h'),
  },
  'transform-flip-v': {
    shortcut: 'Alt+v',
    title: 'toolbar:tools.flipVertical',
    action: { tool: 'rotate', opts: 'vertical' },
    disabled: isFlipDisabled,
    hidden: (options) => isHidden(options, 'transform-flip-v'),
  },
  sgroup: {
    shortcut: 'Mod+g',
    title: 'toolbar:tools.sgroup',
    action: { tool: 'sgroup' },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'sgroup'),
  },
  arrows: {
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'arrows'),
  },
  'reaction-arrow-open-angle': {
    title: 'toolbar:tools.arrowOpenAngle',
    action: { tool: 'reactionarrow', opts: RxnArrowMode.OpenAngle },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'reaction-arrow-open-angle'),
  },
  'reaction-arrow-filled-triangle': {
    title: 'toolbar:tools.arrowFilledTriangle',
    action: { tool: 'reactionarrow', opts: RxnArrowMode.FilledTriangle },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'reaction-arrow-filled-triangle'),
  },
  'reaction-arrow-filled-bow': {
    title: 'toolbar:tools.arrowFilledBow',
    action: { tool: 'reactionarrow', opts: RxnArrowMode.FilledBow },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'reaction-arrow-filled-bow'),
  },
  'reaction-arrow-dashed-open-angle': {
    title: 'toolbar:tools.arrowDashedOpenAngle',
    action: { tool: 'reactionarrow', opts: RxnArrowMode.DashedOpenAngle },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'reaction-arrow-dashed-open-angle'),
  },
  'reaction-arrow-failed': {
    title: 'toolbar:tools.arrowFailed',
    action: { tool: 'reactionarrow', opts: RxnArrowMode.Failed },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'reaction-arrow-failed'),
  },
  'reaction-arrow-retrosynthetic': {
    title: 'toolbar:tools.arrowRetrosynthetic',
    action: { tool: 'reactionarrow', opts: RxnArrowMode.Retrosynthetic },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'reaction-arrow-retrosynthetic'),
  },
  'reaction-arrow-both-ends-filled-triangle': {
    title: 'toolbar:tools.arrowBothEndsFilledTriangle',
    action: {
      tool: 'reactionarrow',
      opts: RxnArrowMode.BothEndsFilledTriangle,
    },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) =>
      isHidden(options, 'reaction-arrow-both-ends-filled-triangle'),
  },
  'reaction-arrow-equilibrium-filled-half-bow': {
    title: 'toolbar:tools.arrowEquilibriumFilledHalfBow',
    action: {
      tool: 'reactionarrow',
      opts: RxnArrowMode.EquilibriumFilledHalfBow,
    },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) =>
      isHidden(options, 'reaction-arrow-equilibrium-filled-half-bow'),
  },
  'reaction-arrow-equilibrium-filled-triangle': {
    title: 'toolbar:tools.arrowEquilibriumFilledTriangle',
    action: {
      tool: 'reactionarrow',
      opts: RxnArrowMode.EquilibriumFilledTriangle,
    },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) =>
      isHidden(options, 'reaction-arrow-equilibrium-filled-triangle'),
  },
  'reaction-arrow-equilibrium-open-angle': {
    title: 'toolbar:tools.arrowEquilibriumOpenAngle',
    action: { tool: 'reactionarrow', opts: RxnArrowMode.EquilibriumOpenAngle },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) =>
      isHidden(options, 'reaction-arrow-equilibrium-open-angle'),
  },
  'reaction-arrow-unbalanced-equilibrium-filled-half-bow': {
    title: 'toolbar:tools.arrowUnbalancedEquilibriumFilledHalfBow',
    action: {
      tool: 'reactionarrow',
      opts: RxnArrowMode.UnbalancedEquilibriumFilledHalfBow,
    },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) =>
      isHidden(
        options,
        'reaction-arrow-unbalanced-equilibrium-filled-half-bow',
      ),
  },
  'reaction-arrow-unbalanced-equilibrium-open-half-angle': {
    title: 'toolbar:tools.arrowUnbalancedEquilibriumOpenHalfAngle',
    action: {
      tool: 'reactionarrow',
      opts: RxnArrowMode.UnbalancedEquilibriumOpenHalfAngle,
    },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) =>
      isHidden(
        options,
        'reaction-arrow-unbalanced-equilibrium-open-half-angle',
      ),
  },
  'reaction-arrow-unbalanced-equilibrium-large-filled-half-bow': {
    title: 'toolbar:tools.arrowUnbalancedEquilibriumLargeFilledHalfBow',
    action: {
      tool: 'reactionarrow',
      opts: RxnArrowMode.UnbalancedEquilibriumLargeFilledHalfBow,
    },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) =>
      isHidden(
        options,
        'reaction-arrow-unbalanced-equilibrium-large-filled-half-bow',
      ),
  },
  'reaction-arrow-unbalanced-equilibrium-filled-half-triangle': {
    title: 'toolbar:tools.arrowUnbalancedEquilibriumFilledHalfTriangle',
    action: {
      tool: 'reactionarrow',
      opts: RxnArrowMode.UnbalancedEquilibriumFilledHalfTriangle,
    },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) =>
      isHidden(
        options,
        'reaction-arrow-unbalanced-equilibrium-filled-half-triangle',
      ),
  },
  'reaction-arrow-elliptical-arc-arrow-filled-bow': {
    title: 'toolbar:tools.arrowEllipticalArcFilledBow',
    action: {
      tool: 'reactionarrow',
      opts: RxnArrowMode.EllipticalArcFilledBow,
    },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) =>
      isHidden(options, 'reaction-arrow-elliptical-arc-arrow-filled-bow'),
  },
  'reaction-arrow-elliptical-arc-arrow-filled-triangle': {
    title: 'toolbar:tools.arrowEllipticalArcFilledTriangle',
    action: {
      tool: 'reactionarrow',
      opts: RxnArrowMode.EllipticalArcFilledTriangle,
    },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) =>
      isHidden(options, 'reaction-arrow-elliptical-arc-arrow-filled-triangle'),
  },
  'reaction-arrow-elliptical-arc-arrow-open-angle': {
    title: 'toolbar:tools.arrowEllipticalArcOpenAngle',
    action: {
      tool: 'reactionarrow',
      opts: RxnArrowMode.EllipticalArcOpenAngle,
    },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) =>
      isHidden(options, 'reaction-arrow-elliptical-arc-arrow-open-angle'),
  },
  'reaction-arrow-elliptical-arc-arrow-open-half-angle': {
    title: 'toolbar:tools.arrowEllipticalArcOpenHalfAngle',
    action: {
      tool: 'reactionarrow',
      opts: RxnArrowMode.EllipticalArcOpenHalfAngle,
    },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) =>
      isHidden(options, 'reaction-arrow-elliptical-arc-arrow-open-half-angle'),
  },
  [MULTITAIL_ARROW_TOOL_NAME]: {
    title: 'toolbar:tools.multitailArrow',
    action: {
      tool: 'reactionarrow',
      opts: MULTITAIL_ARROW_TOOL_NAME,
    },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, MULTITAIL_ARROW_TOOL_NAME),
  },
  'reaction-plus': {
    title: 'toolbar:tools.reactionPlus',
    action: { tool: 'reactionplus' },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'reaction-plus'),
  },
  'reaction-mapping-tools': {
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'reaction-mapping-tools'),
  },
  'reaction-map': {
    title: 'toolbar:tools.reactionMap',
    action: { tool: 'reactionmap' },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'reaction-map'),
  },
  'reaction-unmap': {
    title: 'toolbar:tools.reactionUnmap',
    action: { tool: 'reactionunmap' },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'reaction-unmap'),
  },
  rgroup: {
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'rgroup'),
  },
  'rgroup-label': {
    shortcut: 'Mod+r',
    title: 'toolbar:tools.rgroupLabel',
    action: { tool: 'rgroupatom' },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'rgroup-label'),
  },
  'rgroup-fragment': {
    shortcut: ['Mod+Shift+r', 'Mod+r'],
    title: 'toolbar:tools.rgroupFragment',
    action: { tool: 'rgroupfragment' },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'rgroup-fragment'),
  },
  'rgroup-attpoints': {
    shortcut: 'Mod+r',
    title: 'toolbar:tools.attachmentPoint',
    action: { tool: 'apoint' },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'rgroup-attpoints'),
  },
  [CREATE_MONOMER_TOOL_NAME]: {
    shortcut: 'Mod+m',
    title: 'toolbar:tools.createMonomer',
    action: {
      tool: CREATE_MONOMER_TOOL_NAME,
    },
    disabled: (editor) =>
      editor.isMonomerCreationWizardActive ||
      !editor.isMonomerCreationWizardEnabled,
    hidden: (options) => isHidden(options, CREATE_MONOMER_TOOL_NAME),
  },
  shapes: {
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'shapes'),
  },
  'shape-ellipse': {
    title: 'toolbar:tools.shapeEllipse',
    action: { tool: 'simpleobject', opts: SimpleObjectMode.ellipse },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'shape-ellipse'),
  },
  'shape-rectangle': {
    title: 'toolbar:tools.shapeRectangle',
    action: { tool: 'simpleobject', opts: SimpleObjectMode.rectangle },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'shape-rectangle'),
  },
  'shape-line': {
    title: 'toolbar:tools.shapeLine',
    action: { tool: 'simpleobject', opts: SimpleObjectMode.line },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'shape-line'),
  },
  text: {
    shortcut: 'Alt+t',
    title: 'toolbar:tools.addText',
    action: { tool: 'text' },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'text'),
  },
  bonds: {
    hidden: (options) => isHidden(options, 'bonds'),
  },
  [IMAGE_KEY]: {
    title: 'toolbar:tools.addImage',
    action: { tool: IMAGE_KEY },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, IMAGE_KEY),
  },
};

const bondCuts: Record<string, string> = {
  single: '1',
  double: '2',
  triple: '3',
  up: '1',
  down: '1',
  updown: '1',
  crossed: '2',
  any: '0',
  aromatic: '4',
};

const typeSchema = bondSchema.properties.type;
const bondTypes = typeSchema.enum as string[];
const bondTypeNames = typeSchema.enumNames as string[];

// Full, per-type toolbar tool titles. Kept separate from `bondTypeNames`
// above (a translation-key array resolved separately by whatever reads
// `titleParams.type` - see getBondTypeName/Bond.tsx) because "{type} Bond"-
// style ICU concatenation doesn't translate naturally into every language
// (e.g. zh-CN bond names already include the "bond" word: "单键", "双键",
// ... whereas the bare Bond Properties dropdown / context-menu submenu
// still want the shorter, unsuffixed English "Single"/"Double"/...).
const bondTypeTitleKeys: Record<string, string> = {
  single: 'toolbar:tools.bondTypeTitles.single',
  up: 'toolbar:tools.bondTypeTitles.up',
  down: 'toolbar:tools.bondTypeTitles.down',
  updown: 'toolbar:tools.bondTypeTitles.updown',
  double: 'toolbar:tools.bondTypeTitles.double',
  crossed: 'toolbar:tools.bondTypeTitles.crossed',
  triple: 'toolbar:tools.bondTypeTitles.triple',
  aromatic: 'toolbar:tools.bondTypeTitles.aromatic',
  any: 'toolbar:tools.bondTypeTitles.any',
  hydrogen: 'toolbar:tools.bondTypeTitles.hydrogen',
  singledouble: 'toolbar:tools.bondTypeTitles.singledouble',
  singlearomatic: 'toolbar:tools.bondTypeTitles.singlearomatic',
  doublearomatic: 'toolbar:tools.bondTypeTitles.doublearomatic',
  dative: 'toolbar:tools.bondTypeTitles.dative',
};

const monomerWizardDisallowedBondTypes: Set<string> = new Set(
  MONOMER_WIZARD_DISALLOWED_BOND_TYPES,
);

export default bondTypes.reduce<Record<string, ToolActionEntry>>(
  (res, type, i) => {
    res[`bond-${type}`] = {
      // `type` is '' only for the schema's unused placeholder enum entry,
      // which is never rendered in any toolbar group (see Bond/options.ts) -
      // fall back to a real key so it still satisfies the "every tool has a
      // title" invariant without affecting anything user-visible.
      title: bondTypeTitleKeys[type] ?? bondTypeTitleKeys.single,
      titleParams: { type: bondTypeNames[i] },
      shortcut: bondCuts[type],
      action: {
        tool: 'bond',
        opts: toBondType(type),
      },
      hidden: (options) => isHidden(options, `bond-${type}`),
      ...(monomerWizardDisallowedBondTypes.has(type) && {
        disabled: (editor) => editor.isMonomerCreationWizardActive,
      }),
    };
    return res;
  },
  toolActions,
);
