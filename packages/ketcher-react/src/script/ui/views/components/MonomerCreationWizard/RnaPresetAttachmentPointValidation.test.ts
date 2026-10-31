import { AttachmentPointName } from 'ketcher-core';

import {
  getAttachmentPointRenamesForPhosphatePositionChange,
  getRequiredAttachmentPointsForPhosphatePosition,
  hasPhosphatePositionAttachmentPointConflict,
} from './RnaPresetAttachmentPointValidation';

type AttachmentPointMap = Map<AttachmentPointName, [number, number]>;

describe('getRequiredAttachmentPointsForPhosphatePosition', () => {
  it.each<{
    phosphatePosition: '3' | '5';
    expected: {
      sugar: AttachmentPointName;
      phosphate: AttachmentPointName;
    };
  }>([
    {
      phosphatePosition: '3',
      expected: {
        sugar: AttachmentPointName.R2,
        phosphate: AttachmentPointName.R1,
      },
    },
    {
      phosphatePosition: '5',
      expected: {
        sugar: AttachmentPointName.R1,
        phosphate: AttachmentPointName.R2,
      },
    },
  ])(
    'returns required attachment points for phosphate position selection',
    ({ phosphatePosition, expected }) => {
      expect(
        getRequiredAttachmentPointsForPhosphatePosition(phosphatePosition),
      ).toEqual(expected);
    },
  );
});

describe('hasPhosphatePositionAttachmentPointConflict', () => {
  it.each<{
    name: string;
    phosphatePosition: '3' | '5';
    sugarAttachmentPoints: AttachmentPointMap;
    phosphateAttachmentPoints: AttachmentPointMap;
    expected: boolean;
  }>([
    {
      name: "3' conflicts when sugar already uses R2",
      phosphatePosition: '3',
      sugarAttachmentPoints: new Map([[AttachmentPointName.R2, [1, 10]]]),
      phosphateAttachmentPoints: new Map(),
      expected: true,
    },
    {
      name: "3' conflicts when phosphate already uses R1",
      phosphatePosition: '3',
      sugarAttachmentPoints: new Map(),
      phosphateAttachmentPoints: new Map([[AttachmentPointName.R1, [2, 20]]]),
      expected: true,
    },
    {
      name: "3' does not conflict when sugar uses R1 and phosphate uses R2",
      phosphatePosition: '3',
      sugarAttachmentPoints: new Map([[AttachmentPointName.R1, [1, 10]]]),
      phosphateAttachmentPoints: new Map([[AttachmentPointName.R2, [2, 20]]]),
      expected: false,
    },
    {
      name: "5' conflicts when sugar already uses R1",
      phosphatePosition: '5',
      sugarAttachmentPoints: new Map([[AttachmentPointName.R1, [1, 10]]]),
      phosphateAttachmentPoints: new Map(),
      expected: true,
    },
    {
      name: "5' conflicts when phosphate already uses R2",
      phosphatePosition: '5',
      sugarAttachmentPoints: new Map(),
      phosphateAttachmentPoints: new Map([[AttachmentPointName.R2, [2, 20]]]),
      expected: true,
    },
    {
      name: "5' does not conflict when sugar uses R2 and phosphate uses R1",
      phosphatePosition: '5',
      sugarAttachmentPoints: new Map([[AttachmentPointName.R2, [1, 10]]]),
      phosphateAttachmentPoints: new Map([[AttachmentPointName.R1, [2, 20]]]),
      expected: false,
    },
  ])(
    '$name',
    ({
      phosphatePosition,
      sugarAttachmentPoints,
      phosphateAttachmentPoints,
      expected,
    }) => {
      expect(
        hasPhosphatePositionAttachmentPointConflict(
          phosphatePosition,
          sugarAttachmentPoints,
          phosphateAttachmentPoints,
        ),
      ).toBe(expected);
    },
  );

  it('returns false when attachment point maps are missing', () => {
    expect(hasPhosphatePositionAttachmentPointConflict('3')).toBe(false);
  });
});

describe('getAttachmentPointRenamesForPhosphatePositionChange', () => {
  const { R1, R2 } = AttachmentPointName;

  it.each<{
    name: string;
    previous: '3' | '5' | undefined;
    next: '3' | '5';
    sugar: AttachmentPointMap;
    phosphate: AttachmentPointMap;
    expected: Array<[AttachmentPointName, AttachmentPointName]>;
  }>([
    {
      name: "phosphate R1 becomes R2 when 5' -> 3'",
      previous: '5',
      next: '3',
      sugar: new Map(),
      phosphate: new Map([[R1, [1, 2]]]),
      expected: [[R1, R2]],
    },
    {
      name: "phosphate R2 becomes R1 when 3' -> 5'",
      previous: '3',
      next: '5',
      sugar: new Map(),
      phosphate: new Map([[R2, [1, 2]]]),
      expected: [[R2, R1]],
    },
    {
      name: "sugar R2 becomes R1 when 5' -> 3'",
      previous: '5',
      next: '3',
      sugar: new Map([[R2, [1, 2]]]),
      phosphate: new Map(),
      expected: [[R2, R1]],
    },
    {
      name: "sugar R1 becomes R2 when 3' -> 5'",
      previous: '3',
      next: '5',
      sugar: new Map([[R1, [1, 2]]]),
      phosphate: new Map(),
      expected: [[R1, R2]],
    },
    {
      name: 'a single swap is returned when sugar and phosphate renames are inverse',
      previous: '5',
      next: '3',
      sugar: new Map([[R2, [1, 2]]]),
      phosphate: new Map([[R1, [3, 4]]]),
      expected: [[R2, R1]],
    },
    {
      name: 'nothing is renamed when there is no collision',
      previous: '5',
      next: '3',
      sugar: new Map([[R1, [1, 2]]]),
      phosphate: new Map([[R2, [3, 4]]]),
      expected: [],
    },
    {
      name: 'nothing is renamed when the position was not set before',
      previous: undefined,
      next: '3',
      sugar: new Map([[R2, [1, 2]]]),
      phosphate: new Map([[R1, [3, 4]]]),
      expected: [],
    },
    {
      name: 'nothing is renamed when the position is unchanged',
      previous: '3',
      next: '3',
      sugar: new Map([[R2, [1, 2]]]),
      phosphate: new Map([[R1, [3, 4]]]),
      expected: [],
    },
  ])('$name', ({ previous, next, sugar, phosphate, expected }) => {
    expect(
      getAttachmentPointRenamesForPhosphatePositionChange(
        previous,
        next,
        sugar,
        phosphate,
      ),
    ).toEqual(expected);
  });
});
