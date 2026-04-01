import { AttachmentPointName } from 'ketcher-core';

import {
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
    expect(
      hasPhosphatePositionAttachmentPointConflict('3', undefined, undefined),
    ).toBe(false);
  });
});
