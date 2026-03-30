import { AttachmentPointName, Bond, Struct } from 'ketcher-core';

import { inferPhosphatePosition } from './PhosphatePositionInference';

type AttachmentPointMap = Map<AttachmentPointName, [number, number]>;

const createWizardStruct = (
  atomIds: number[],
  bonds: Array<Pick<Bond, 'begin' | 'end'>>,
): Struct =>
  ({
    atoms: new Map(atomIds.map((atomId) => [atomId, {}])),
    bonds: new Map(bonds.map((bond, bondId) => [bondId, bond])),
  } as Struct);

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
      phosphateAttachmentPoints: new Map([[AttachmentPointName.R1, [3, 30]]]),
      bonds: [{ begin: 3, end: 100 }],
      expected: '5',
    },
    {
      name: "3' when phosphate has an external R2 only",
      sugarAttachmentPoints: new Map(),
      phosphateAttachmentPoints: new Map([[AttachmentPointName.R2, [3, 30]]]),
      bonds: [{ begin: 3, end: 100 }],
      expected: '3',
    },
    {
      name: "3' when sugar has an external R1 only",
      sugarAttachmentPoints: new Map([[AttachmentPointName.R1, [1, 10]]]),
      phosphateAttachmentPoints: new Map(),
      bonds: [{ begin: 1, end: 100 }],
      expected: '3',
    },
    {
      name: "5' when sugar has an external R2 only",
      sugarAttachmentPoints: new Map([[AttachmentPointName.R2, [1, 10]]]),
      phosphateAttachmentPoints: new Map(),
      bonds: [{ begin: 1, end: 100 }],
      expected: '5',
    },
    {
      name: "3' when sugar exposes both external R1 and R2",
      sugarAttachmentPoints: new Map([
        [AttachmentPointName.R1, [1, 10]],
        [AttachmentPointName.R2, [2, 20]],
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
        [AttachmentPointName.R1, [3, 30]],
        [AttachmentPointName.R2, [4, 40]],
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
      sugarAttachmentPoints: new Map([[AttachmentPointName.R3, [1, 10]]]),
      phosphateAttachmentPoints: new Map([[AttachmentPointName.R3, [3, 30]]]),
      bonds: [
        { begin: 1, end: 100 },
        { begin: 3, end: 101 },
      ],
      expected: '3',
    },
    {
      name: "3' when sugar and phosphate infer conflicting positions",
      sugarAttachmentPoints: new Map([[AttachmentPointName.R2, [1, 10]]]),
      phosphateAttachmentPoints: new Map([[AttachmentPointName.R2, [3, 30]]]),
      bonds: [
        { begin: 1, end: 100 },
        { begin: 3, end: 101 },
      ],
      expected: '3',
    },
  ])(
    'returns $expected for $name',
    ({ sugarAttachmentPoints, phosphateAttachmentPoints, bonds, expected }) => {
      expect(
        inferPhosphatePosition(
          createWizardStruct([1, 2, 3, 4, 100, 101], bonds),
          {
            atoms: [1, 2],
            bonds: [],
          },
          sugarAttachmentPoints,
          {
            atoms: [3, 4],
            bonds: [],
          },
          phosphateAttachmentPoints,
        ),
      ).toBe(expected);
    },
  );
});
