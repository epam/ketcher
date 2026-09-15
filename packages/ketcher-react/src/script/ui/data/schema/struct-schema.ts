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

import { mapOf } from './schema-helper';
import { range } from 'lodash/fp';
import { sdataCustomSchema } from './sdata-schema';
import { CUSTOM_QUERY_MAX_LENGTH } from 'ketcher-core';
import i18n from 'src/i18n/i18n';

export { CUSTOM_QUERY_MAX_LENGTH };

function customQueryInvalidMessage(value: unknown): string {
  if (typeof value === 'string' && value.length > CUSTOM_QUERY_MAX_LENGTH) {
    return i18n.t(
      'dialogs:toolbox.structSchema.customQuery.invalidMessageTooLong',
      {
        maxLength: CUSTOM_QUERY_MAX_LENGTH,
      },
    );
  }
  return i18n.t(
    'dialogs:toolbox.structSchema.customQuery.invalidMessageInvalid',
  );
}

interface CommonStructSchema {
  key?: string;
  title: string;
  type?: string;
  required?: string[];
}

export interface SchemaProperty extends CommonStructSchema {
  enum?: unknown[];
  enumNames?: string[];
  default?: unknown;
  format?: string;
  pattern?: string;
  maxLength?: number;
  minLength?: number;
  invalidMessage?: string | ((data: unknown) => string);
}

export interface StructSchema<
  T = Record<string, SchemaProperty | Record<string, unknown>>,
> extends CommonStructSchema {
  properties: T;
}

interface AtomProperties extends Record<string, SchemaProperty> {
  alias: SchemaProperty;
  aromaticity: SchemaProperty;
  atomList: SchemaProperty;
  atomType: SchemaProperty;
  charge: SchemaProperty;
  chirality: SchemaProperty;
  cip: SchemaProperty;
  connectivity: SchemaProperty;
  customQuery: SchemaProperty;
  exactChangeFlag: SchemaProperty;
  explicitValence: SchemaProperty;
  hCount: SchemaProperty;
  implicitHCount: SchemaProperty;
  invRet: SchemaProperty;
  isotope: SchemaProperty;
  label: SchemaProperty;
  notList: SchemaProperty;
  pseudo: SchemaProperty;
  radical: SchemaProperty;
  ringBondCount: SchemaProperty;
  ringMembership: SchemaProperty;
  ringSize: SchemaProperty;
  substitutionCount: SchemaProperty;
  unsaturatedAtom: SchemaProperty;
}

export const atom: StructSchema<AtomProperties> = {
  title: 'Atom',
  type: 'object',
  required: ['label'],
  properties: {
    atomType: {
      title: 'dialogs:toolbox.structSchema.atom.atomType.title',
      enum: ['single', 'list', 'pseudo'],
      enumNames: [
        'dialogs:toolbox.structSchema.atom.atomType.enumSingle',
        'dialogs:toolbox.structSchema.atom.atomType.enumList',
        'dialogs:toolbox.structSchema.atom.atomType.enumSpecial',
      ],
      default: 'single',
    },
    label: {
      title: 'dialogs:toolbox.structSchema.atom.label.title',
      type: 'string', // TODO:should really be enum of elements
      maxLength: 3,
      invalidMessage: () =>
        i18n.t('dialogs:toolbox.structSchema.atom.label.invalidMessage'),
    },
    atomList: {
      title: 'dialogs:toolbox.structSchema.atom.atomList.title',
      type: 'string',
      invalidMessage: () =>
        i18n.t('dialogs:toolbox.structSchema.atom.atomList.invalidMessage'),
    },
    notList: {
      title: 'dialogs:toolbox.structSchema.atom.notList.title',
      type: 'boolean',
      default: false,
    },
    pseudo: {
      title: 'dialogs:toolbox.structSchema.atom.pseudo.title',
      type: 'string',
      invalidMessage: () =>
        i18n.t('dialogs:toolbox.structSchema.atom.pseudo.invalidMessage'),
    },
    alias: {
      title: 'dialogs:toolbox.structSchema.atom.alias.title',
      type: 'string',
      invalidMessage: () =>
        i18n.t('dialogs:toolbox.structSchema.atom.alias.invalidMessage'),
    },
    charge: {
      title: 'dialogs:toolbox.structSchema.atom.charge.title',
      type: 'string',
      pattern: '^([+-]?)(1[0-5]|0|[0-9])([+-]?)$',
      maxLength: 4,
      default: '',
      invalidMessage: () =>
        i18n.t('dialogs:toolbox.structSchema.atom.charge.invalidMessage'),
    },
    explicitValence: {
      title: 'dialogs:toolbox.structSchema.atom.explicitValence.title',
      enum: [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8],
      enumNames: ['', '0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'],
      default: -1,
    },
    isotope: {
      title: 'dialogs:toolbox.structSchema.atom.isotope.title',
      type: 'string',
      pattern: '^[0-9]{1,3}$|(^$)',
      default: '',
      maxLength: 3,
      invalidMessage: () =>
        i18n.t('dialogs:toolbox.structSchema.atom.isotope.invalidMessage'),
    },
    radical: {
      title: 'dialogs:toolbox.structSchema.atom.radical.title',
      enum: [0, 2, 1, 3],
      enumNames: [
        '',
        'dialogs:toolbox.structSchema.atom.radical.enumMonoradical',
        'dialogs:toolbox.structSchema.atom.radical.enumDiradicalSinglet',
        'dialogs:toolbox.structSchema.atom.radical.enumDiradicalTriplet',
      ],
      default: 0,
    },
    cip: {
      title: 'dialogs:toolbox.structSchema.cip.title',
      type: 'string',
      enum: ['R', 'S', 'r', 's'],
    },
    ringBondCount: {
      title: 'dialogs:toolbox.structSchema.atom.ringBondCount.title',
      enum: [0, -2, -1, 2, 3, 4, 5, 6, 7, 8, 9],
      enumNames: [
        '',
        'dialogs:toolbox.structSchema.atom.ringBondCount.enumAsDrawn',
        '0',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
      ],
      default: 0,
    },
    hCount: {
      title: 'dialogs:toolbox.structSchema.atom.hCount.title',
      enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      enumNames: ['', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      default: 0,
    },
    substitutionCount: {
      title: 'dialogs:toolbox.structSchema.atom.substitutionCount.title',
      enum: [0, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      enumNames: [
        '',
        'dialogs:toolbox.structSchema.atom.substitutionCount.enumAsDrawn',
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
      ],
      default: 0,
    },
    unsaturatedAtom: {
      title: 'dialogs:toolbox.structSchema.atom.unsaturatedAtom.title',
      type: 'boolean',
      default: false,
    },
    aromaticity: {
      title: 'dialogs:toolbox.structSchema.atom.aromaticity.title',
      enum: [null, 'aromatic', 'aliphatic'],
      enumNames: [
        '',
        'dialogs:toolbox.structSchema.atom.aromaticity.enumAromatic',
        'dialogs:toolbox.structSchema.atom.aromaticity.enumAliphatic',
      ],
      default: 0,
    },
    implicitHCount: {
      title: 'dialogs:toolbox.structSchema.atom.implicitHCount.title',
      enum: [null, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      enumNames: ['', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      default: 0,
    },
    ringMembership: {
      title: 'dialogs:toolbox.structSchema.atom.ringMembership.title',
      enum: [null, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      enumNames: ['', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      default: 0,
    },
    ringSize: {
      title: 'dialogs:toolbox.structSchema.atom.ringSize.title',
      enum: [null, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      enumNames: ['', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      default: 0,
    },
    connectivity: {
      title: 'dialogs:toolbox.structSchema.atom.connectivity.title',
      enum: [null, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      enumNames: ['', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      default: 0,
    },
    chirality: {
      title: 'dialogs:toolbox.structSchema.atom.chirality.title',
      enum: [null, 'anticlockwise', 'clockwise'],
      enumNames: [
        '',
        'dialogs:toolbox.structSchema.atom.chirality.enumAnticlockwise',
        'dialogs:toolbox.structSchema.atom.chirality.enumClockwise',
      ],
      default: 0,
    },
    customQuery: {
      title: 'dialogs:toolbox.structSchema.customQuery.title',
      pattern: '[^ ]',
      maxLength: CUSTOM_QUERY_MAX_LENGTH,
      type: 'string',
      invalidMessage: customQueryInvalidMessage,
    },
    invRet: {
      title: 'dialogs:toolbox.structSchema.atom.invRet.title',
      enum: [0, 1, 2],
      enumNames: [
        '',
        'dialogs:toolbox.structSchema.atom.invRet.enumInverts',
        'dialogs:toolbox.structSchema.atom.invRet.enumRetains',
      ],
      default: 0,
    },
    exactChangeFlag: {
      title: 'dialogs:toolbox.structSchema.atom.exactChangeFlag.title',
      type: 'boolean',
      default: false,
    },
  },
};

export const rgroupSchema: StructSchema = {
  title: 'R-group',
  type: 'object',
  properties: {
    values: {
      type: 'array',
      items: {
        type: 'string',
        enum: range(1, 33),
        enumNames: range(1, 33).map((item: number) => 'R' + item),
      },
    },
  },
};

export const labelEdit: StructSchema = {
  title: 'Label Edit',
  type: 'object',
  required: ['label'],
  properties: {
    label: {
      title: 'dialogs:toolbox.structSchema.labelEditField.title',
      default: '',
      invalidMessage: () =>
        i18n.t('dialogs:toolbox.structSchema.labelEditField.invalidMessage'),
      type: 'string',
    },
  },
};

export const attachmentPoints: StructSchema = {
  title: 'Attachment Points',
  type: 'object',
  properties: {
    primary: {
      title: 'dialogs:toolbox.structSchema.attachmentPoints.primary.title',
      type: 'boolean',
    },
    secondary: {
      title: 'dialogs:toolbox.structSchema.attachmentPoints.secondary.title',
      type: 'boolean',
    },
  },
};

export const bond: StructSchema = {
  title: 'Bond',
  type: 'object',
  required: ['type'],
  properties: {
    type: {
      title: 'dialogs:toolbox.structSchema.bond.type.title',
      enum: [
        '',
        'single',
        'up',
        'down',
        'updown',
        'double',
        'crossed',
        'triple',
        'aromatic',
        'any',
        'hydrogen',
        'singledouble',
        'singlearomatic',
        'doublearomatic',
        'dative',
      ],
      enumNames: [
        '',
        'dialogs:toolbox.structSchema.bond.type.enumSingle',
        'dialogs:toolbox.structSchema.bond.type.enumSingleUp',
        'dialogs:toolbox.structSchema.bond.type.enumSingleDown',
        'dialogs:toolbox.structSchema.bond.type.enumSingleUpDown',
        'dialogs:toolbox.structSchema.bond.type.enumDouble',
        'dialogs:toolbox.structSchema.bond.type.enumDoubleCisTrans',
        'dialogs:toolbox.structSchema.bond.type.enumTriple',
        'dialogs:toolbox.structSchema.bond.type.enumAromatic',
        'dialogs:toolbox.structSchema.bond.type.enumAny',
        'dialogs:toolbox.structSchema.bond.type.enumHydrogen',
        'dialogs:toolbox.structSchema.bond.type.enumSingleDouble',
        'dialogs:toolbox.structSchema.bond.type.enumSingleAromatic',
        'dialogs:toolbox.structSchema.bond.type.enumDoubleAromatic',
        'dialogs:toolbox.structSchema.bond.type.enumDative',
      ],
      default: 'single',
    },
    topology: {
      title: 'dialogs:toolbox.structSchema.bond.topology.title',
      enum: [null, 0, 1, 2],
      enumNames: [
        '',
        'dialogs:toolbox.structSchema.bond.topology.enumEither',
        'dialogs:toolbox.structSchema.bond.topology.enumRing',
        'dialogs:toolbox.structSchema.bond.topology.enumChain',
      ],
      default: 0,
    },
    customQuery: {
      title: 'dialogs:toolbox.structSchema.customQuery.title',
      pattern: '[^ ]',
      maxLength: CUSTOM_QUERY_MAX_LENGTH,
      type: 'string',
      invalidMessage: customQueryInvalidMessage,
    },
    center: {
      title: 'dialogs:toolbox.structSchema.bond.center.title',
      enum: [null, 0, -1, 1, 2, 4, 8, 12], // 5, 9, 13
      enumNames: [
        '',
        'dialogs:toolbox.structSchema.bond.center.enumUnmarked',
        'dialogs:toolbox.structSchema.bond.center.enumNotCenter',
        'dialogs:toolbox.structSchema.bond.center.enumCenter',
        'dialogs:toolbox.structSchema.bond.center.enumNoChange',
        'dialogs:toolbox.structSchema.bond.center.enumMadeBroken',
        'dialogs:toolbox.structSchema.bond.center.enumOrderChanges',
        'dialogs:toolbox.structSchema.bond.center.enumMadeBrokenAndChanges',
      ], // "Order changes" x 3
      default: 0,
    },
    cip: {
      title: 'dialogs:toolbox.structSchema.cip.title',
      type: 'string',
      enum: ['E', 'Z', 'M', 'P'],
    },
  },
};

const sgroup: Omit<StructSchema, 'properties'> & {
  oneOf?: Partial<StructSchema>[];
} = {
  title: 'SGroup',
  type: 'object',
  required: ['type'],
  oneOf: [
    {
      ...sdataCustomSchema,
    },
    {
      key: 'MUL',
      title: 'dialogs:toolbox.structSchema.sgroup.variantMultipleGroup',
      type: 'object',
      properties: {
        type: { enum: ['MUL'] },
        mul: {
          title: 'dialogs:toolbox.structSchema.sgroup.mulCount.title',
          type: 'integer',
          default: 1,
          minimum: 1,
          maximum: 200,
        },
      },
      required: ['mul'],
    },
    {
      key: 'SRU',
      title: 'dialogs:toolbox.structSchema.sgroup.variantSruPolymer',
      type: 'object',
      properties: {
        type: { enum: ['SRU'] },
        subscript: {
          title: 'dialogs:toolbox.structSchema.sgroup.subscript.title',
          type: 'string',
          default: 'n',
          // any string, except empty and including double quotes
          pattern: '^(?!\\s*$)[^"]+$',
          invalidMessage: () =>
            i18n.t(
              'dialogs:toolbox.structSchema.sgroup.subscript.invalidMessage',
            ),
        },
        connectivity: {
          title: 'dialogs:toolbox.structSchema.sgroup.repeatPattern.title',
          enum: ['ht', 'hh', 'eu'],
          enumNames: [
            'dialogs:toolbox.structSchema.sgroup.repeatPattern.enumHeadToTail',
            'dialogs:toolbox.structSchema.sgroup.repeatPattern.enumHeadToHead',
            'dialogs:toolbox.structSchema.sgroup.repeatPattern.enumEitherUnknown',
          ],
          default: 'ht',
        },
      },
      required: ['subscript', 'connectivity'],
    },
    {
      key: 'COP',
      title: 'dialogs:toolbox.structSchema.sgroup.variantCopolymer',
      type: 'object',
      properties: {
        type: { enum: ['COP'] },
        subtype: {
          title: 'dialogs:toolbox.structSchema.sgroup.subtype.title',
          enum: [null, 'ran', 'blo', 'alt'],
          enumNames: [
            'dialogs:toolbox.structSchema.sgroup.subtype.enumBlank',
            'dialogs:toolbox.structSchema.sgroup.subtype.enumRandom',
            'dialogs:toolbox.structSchema.sgroup.subtype.enumBlock',
            'dialogs:toolbox.structSchema.sgroup.subtype.enumAlternating',
          ],
        },
        connectivity: {
          title: 'dialogs:toolbox.structSchema.sgroup.repeatPattern.title',
          enum: ['ht', 'hh', 'eu'],
          enumNames: [
            'dialogs:toolbox.structSchema.sgroup.repeatPattern.enumHeadToTail',
            'dialogs:toolbox.structSchema.sgroup.repeatPattern.enumHeadToHead',
            'dialogs:toolbox.structSchema.sgroup.repeatPattern.enumEitherUnknown',
          ],
          default: 'ht',
        },
      },
      required: ['connectivity'],
    },
    {
      key: 'SUP',
      title: 'dialogs:toolbox.structSchema.sgroup.variantSuperatom',
      type: 'object',
      properties: {
        type: { enum: ['SUP'] },
        name: {
          title: 'dialogs:toolbox.structSchema.sgroup.name.title',
          type: 'string',
          default: '',
          minLength: 1,
          invalidMessage: () =>
            i18n.t('dialogs:toolbox.structSchema.sgroup.name.invalidMessage'),
        },
      },
      required: ['name'],
    },
    {
      key: 'queryComponent',
      title: 'dialogs:toolbox.structSchema.sgroup.variantQueryComponent',
      type: 'object',
      properties: {
        type: { enum: ['queryComponent'] },
      },
    },
    {
      key: 'nucleotideComponent',
      title: 'dialogs:toolbox.structSchema.sgroup.variantNucleotideComponent',
      type: 'object',
      properties: {
        type: { enum: ['nucleotideComponent'] },
        class: {
          title: 'dialogs:toolbox.structSchema.sgroup.component.title',
          enum: ['SUGAR', 'BASE', 'PHOSPHATE'],
          enumNames: [
            'dialogs:toolbox.structSchema.sgroup.component.enumSugar',
            'dialogs:toolbox.structSchema.sgroup.component.enumBase',
            'dialogs:toolbox.structSchema.sgroup.component.enumPhosphate',
          ],
          default: 'Sugar',
        },
      },
      required: ['class'],
    },
  ],
};

export const sgroupMap: Record<string, StructSchema> = mapOf(sgroup, 'type');

export const rgroupLogic: StructSchema = {
  title: 'R-Group',
  type: 'object',
  properties: {
    range: {
      title: 'dialogs:toolbox.structSchema.rgroupLogicFields.occurrence.title',
      type: 'string',
      maxLength: 50,
      invalidMessage: () =>
        i18n.t(
          'dialogs:toolbox.structSchema.rgroupLogicFields.occurrence.invalidMessage',
        ),
    },
    resth: {
      title: 'dialogs:toolbox.structSchema.rgroupLogicFields.resth.title',
      type: 'boolean',
    },
    ifthen: {
      title: 'dialogs:toolbox.structSchema.rgroupLogicFields.condition.title',
      type: 'integer',
      minimum: 0,
    },
  },
};

export const textSchema: StructSchema = {
  title: 'Text Edit',
  type: 'object',
  required: ['label'],
  properties: {
    label: {
      default: '',
      type: 'string',
    },
  },
};

export const attachSchema: StructSchema = {
  title: 'Template edit',
  type: 'object',
  required: ['name'],
  properties: {
    name: {
      title: 'dialogs:toolbox.structSchema.attachSchema.name.title',
      type: 'string',
      minLength: 1,
      maxLength: 128,
      invalidMessage: () =>
        i18n.t('dialogs:toolbox.structSchema.attachSchema.name.invalidMessage'),
    },
  },
};
