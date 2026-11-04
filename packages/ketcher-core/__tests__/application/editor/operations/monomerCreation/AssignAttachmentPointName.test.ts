import { AssignAttachmentAtomOperation } from 'application/editor/operations/monomerCreation/AssignAttachmentAtomOperation';
import { AssignLeavingGroupAtomOperation } from 'application/editor/operations/monomerCreation/AssignLeavingGroupAtomOperation';
import type { MonomerCreationState, ReStruct } from 'application/render';
import { AttachmentPointName } from 'domain/types';

type AttachmentPoints = Map<AttachmentPointName, [number, number]>;

const createState = (
  assignedAttachmentPoints: AttachmentPoints,
  connectionAttachmentPoints?: AttachmentPoints,
) =>
  ({
    assignedAttachmentPoints,
    connectionAttachmentPoints,
    potentialAttachmentPoints: new Map([[10, new Set([11])]]),
  }) as unknown as NonNullable<MonomerCreationState>;

describe('attachment point name assignment in monomer creation', () => {
  // No atoms in restruct, so atom invalidation is skipped
  const restruct = {
    atoms: new Map(),
    getBondEndpoint: () => undefined,
  } as unknown as ReStruct;

  describe.each([
    [
      'AssignAttachmentAtomOperation',
      (state: NonNullable<MonomerCreationState>) =>
        new AssignAttachmentAtomOperation(state, 10, 11),
    ],
    [
      'AssignLeavingGroupAtomOperation',
      (state: NonNullable<MonomerCreationState>) =>
        new AssignLeavingGroupAtomOperation(state, 11),
    ],
  ])('%s', (_name, createOperation) => {
    it('assigns R1 when there are no attachment points', () => {
      const state = createState(new Map());

      createOperation(state).execute(restruct);

      expect([...state.assignedAttachmentPoints.keys()]).toEqual([
        AttachmentPointName.R1,
      ]);
    });

    it('skips names taken by connection points between preset components', () => {
      const state = createState(
        new Map(),
        new Map([[AttachmentPointName.R1, [1, 2]]]),
      );

      createOperation(state).execute(restruct);

      expect([...state.assignedAttachmentPoints.keys()]).toEqual([
        AttachmentPointName.R2,
      ]);
    });

    it('skips both assigned and connection point names', () => {
      const state = createState(
        new Map([[AttachmentPointName.R1, [3, 4]]]),
        new Map([
          [AttachmentPointName.R2, [1, 2]],
          [AttachmentPointName.R3, [5, 6]],
        ]),
      );

      createOperation(state).execute(restruct);

      expect(
        state.assignedAttachmentPoints.get(AttachmentPointName.R4),
      ).toEqual([10, 11]);
    });
  });

  it('keeps explicitly passed attachment point name', () => {
    const state = createState(
      new Map(),
      new Map([[AttachmentPointName.R1, [1, 2]]]),
    );

    new AssignAttachmentAtomOperation(
      state,
      10,
      11,
      AttachmentPointName.R1,
      new Map(),
    ).execute(restruct);

    expect(state.assignedAttachmentPoints.size).toBe(0);
  });
});
