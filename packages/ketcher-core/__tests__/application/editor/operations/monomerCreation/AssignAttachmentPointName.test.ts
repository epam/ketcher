import { AssignAttachmentAtomOperation } from 'application/editor/operations/monomerCreation/AssignAttachmentAtomOperation';
import { AssignLeavingGroupAtomOperation } from 'application/editor/operations/monomerCreation/AssignLeavingGroupAtomOperation';
import type {
  AssignedAttachmentPoints,
  MonomerCreationState,
  ReStruct,
} from 'application/render';
import { AttachmentPointName } from 'domain/types';

type AttachmentPoints = AssignedAttachmentPoints;

const createAttachmentPoints = (
  entries: Array<[number, AttachmentPointName, [number, number]]>,
): AttachmentPoints =>
  new Map(
    entries.map(([id, name, [attachmentAtomId, leavingAtomId]]) => [
      id,
      { name, attachmentAtomId, leavingAtomId },
    ]),
  );

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

      expect(
        [...state.assignedAttachmentPoints.values()].map(({ name }) => name),
      ).toEqual([AttachmentPointName.R1]);
    });

    it('skips names taken by connection points between preset components', () => {
      const state = createState(
        new Map(),
        createAttachmentPoints([[0, AttachmentPointName.R1, [1, 2]]]),
      );

      createOperation(state).execute(restruct);

      expect(
        [...state.assignedAttachmentPoints.values()].map(({ name }) => name),
      ).toEqual([AttachmentPointName.R2]);
    });

    it('skips both assigned and connection point names', () => {
      const state = createState(
        createAttachmentPoints([[0, AttachmentPointName.R1, [3, 4]]]),
        createAttachmentPoints([
          [0, AttachmentPointName.R2, [1, 2]],
          [1, AttachmentPointName.R3, [5, 6]],
        ]),
      );

      createOperation(state).execute(restruct);

      expect(
        [...state.assignedAttachmentPoints.values()].find(
          ({ name }) => name === AttachmentPointName.R4,
        ),
      ).toEqual({
        name: AttachmentPointName.R4,
        attachmentAtomId: 10,
        leavingAtomId: 11,
      });
    });
  });

  it('keeps explicitly passed attachment point name', () => {
    const state = createState(
      new Map(),
      createAttachmentPoints([[0, AttachmentPointName.R1, [1, 2]]]),
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
