import { AttachmentPointName, Bond } from 'ketcher-core';

import { inferPhosphatePosition } from './PhosphatePositionInference';

type AttachmentPointMap = Map<
  number,
  { name: AttachmentPointName; leavingAtomId: number }
>;

describe('inferPhosphatePosition', () => {
  it.each<{
    name: string;
    sugarAttachmentPoints: AttachmentPointMap;
    phosphateAttachmentPoints: AttachmentPointMap;
    bonds: Array<Pick<Bond, 'begin' | 'end'>>;
    expected: '3' | '5';
  }>([
    {
      name: "5' when phosphate has an external R1 only",
      sugarAttachmentPoints: new Map(),
      phosphateAttachmentPoints: new Map([
        [3, { name: AttachmentPointName.R1, leavingAtomId: 30 }],
      ]),
      bonds: [{ begin: 3, end: 100 }],
      expected: '5',
    },
    {
      name: "3' when phosphate has an external R2 only",
      sugarAttachmentPoints: new Map(),
      phosphateAttachmentPoints: new Map([
        [3, { name: AttachmentPointName.R2, leavingAtomId: 30 }],
      ]),
      bonds: [{ begin: 3, end: 100 }],
      expected: '3',
    },
    {
      name: "3' when sugar has an external R1 only",
      sugarAttachmentPoints: new Map([
        [1, { name: AttachmentPointName.R1, leavingAtomId: 10 }],
      ]),
      phosphateAttachmentPoints: new Map(),
      bonds: [{ begin: 1, end: 100 }],
      expected: '3',
    },
    {
      name: "5' when sugar has an external R2 only",
      sugarAttachmentPoints: new Map([
        [1, { name: AttachmentPointName.R2, leavingAtomId: 10 }],
      ]),
      phosphateAttachmentPoints: new Map(),
      bonds: [{ begin: 1, end: 100 }],
      expected: '5',
    },
    {
      name: "3' when sugar exposes both external R1 and R2",
      sugarAttachmentPoints: new Map([
        [1, { name: AttachmentPointName.R1, leavingAtomId: 10 }],
        [2, { name: AttachmentPointName.R2, leavingAtomId: 20 }],
      ]),
      phosphateAttachmentPoints: new Map(),
      bonds: [
        { begin: 1, end: 100 },
        { begin: 2, end: 101 },
      ],
      expected: '3',
    },
    {
      name: "3' when phosphate exposes both external R1 and R2",
      sugarAttachmentPoints: new Map(),
      phosphateAttachmentPoints: new Map([
        [3, { name: AttachmentPointName.R1, leavingAtomId: 30 }],
        [4, { name: AttachmentPointName.R2, leavingAtomId: 40 }],
      ]),
      bonds: [
        { begin: 3, end: 100 },
        { begin: 4, end: 101 },
      ],
      expected: '3',
    },
    {
      name: "3' when neither sugar nor phosphate has external R1 or R2",
      sugarAttachmentPoints: new Map(),
      phosphateAttachmentPoints: new Map(),
      bonds: [],
      expected: '3',
    },
    {
      name: "3' when only non-R1 and non-R2 external attachment points exist",
      sugarAttachmentPoints: new Map([
        [1, { name: AttachmentPointName.R3, leavingAtomId: 10 }],
      ]),
      phosphateAttachmentPoints: new Map([
        [3, { name: AttachmentPointName.R3, leavingAtomId: 30 }],
      ]),
      bonds: [
        { begin: 1, end: 100 },
        { begin: 3, end: 101 },
      ],
      expected: '3',
    },
    {
      name: "3' when sugar and phosphate infer conflicting positions",
      sugarAttachmentPoints: new Map([
        [1, { name: AttachmentPointName.R2, leavingAtomId: 10 }],
      ]),
      phosphateAttachmentPoints: new Map([
        [3, { name: AttachmentPointName.R2, leavingAtomId: 30 }],
      ]),
      bonds: [
        { begin: 1, end: 100 },
        { begin: 3, end: 101 },
      ],
      expected: '3',
    },
  ])(
    'returns $expected for $name',
    ({ sugarAttachmentPoints, phosphateAttachmentPoints, expected }) => {
      expect(
        inferPhosphatePosition(
          sugarAttachmentPoints,
          phosphateAttachmentPoints,
        ),
      ).toBe(expected);
    },
  );
});
