import { Atom, AttachmentPointName, Struct, Vec2 } from 'ketcher-core';
import type { Editor } from '../../../../../editor';
import { useAttachmentPointSelectsData } from './useAttachmentPointSelectsData';

// Regression tests for https://github.com/epam/ketcher/issues/12132:
// in an RNA preset, the name selector of a component's attachment point must
// treat the connection points between preset components as occupied.

const { R1, R2, R3, R4, R5, R6, R7, R8 } = AttachmentPointName;

function buildEditor(
  assignedNames: AttachmentPointName[],
  connectionNames: AttachmentPointName[] = [],
): Editor {
  const struct = new Struct();
  const assignedAttachmentPoints = new Map<
    AttachmentPointName,
    [number, number]
  >();
  assignedNames.forEach((name, i) => {
    const attachmentAtomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(i, 0) }),
    );
    const leavingAtomId = struct.atoms.add(
      new Atom({ label: 'H', pp: new Vec2(i, 1) }),
    );
    assignedAttachmentPoints.set(name, [attachmentAtomId, leavingAtomId]);
  });

  const connectionAttachmentPoints = new Map<
    AttachmentPointName,
    [number, number]
  >(connectionNames.map((name) => [name, [-1, -1]]));

  return {
    monomerCreationState: {
      assignedAttachmentPoints,
      connectionAttachmentPoints,
    },
    struct: () => struct,
  } as unknown as Editor;
}

const describeOptions = (
  data: ReturnType<typeof useAttachmentPointSelectsData>,
) =>
  data?.nameOptions.map(({ value, markedAsUsed, disabled }) => ({
    value,
    markedAsUsed,
    disabled,
  }));

describe('useAttachmentPointSelectsData', () => {
  it('offers the next free name and disables names taken by preset connection points', () => {
    // Sugar already uses R2 and R3 to connect to phosphate and base; the user
    // marks a new connection point, which is created as R1.
    const editor = buildEditor([R1], [R2, R3]);

    const data = useAttachmentPointSelectsData(editor, R1);

    expect(describeOptions(data)).toEqual([
      { value: R1, markedAsUsed: true, disabled: true },
      { value: R2, markedAsUsed: true, disabled: true },
      { value: R3, markedAsUsed: true, disabled: true },
      { value: R4, markedAsUsed: false, disabled: false },
    ]);
  });

  it('uses connection point names passed explicitly instead of the editor state', () => {
    const editor = buildEditor([R1]);

    const data = useAttachmentPointSelectsData(editor, R1, [R2, R3]);

    expect(data?.nameOptions.map(({ value }) => value)).toEqual([
      R1,
      R2,
      R3,
      R4,
    ]);
    expect(
      data?.nameOptions
        .filter(({ disabled }) => !disabled)
        .map(({ value }) => value),
    ).toEqual([R4]);
  });

  it('keeps the regular monomer behaviour when there are no connection points', () => {
    // A plain monomer with R1 and R2: R1..R3 are offered, the current name is
    // selectable, the other assigned name is only marked as used.
    const editor = buildEditor([R1, R2]);

    const data = useAttachmentPointSelectsData(editor, R1);

    expect(describeOptions(data)).toEqual([
      { value: R1, markedAsUsed: false, disabled: false },
      { value: R2, markedAsUsed: true, disabled: false },
      { value: R3, markedAsUsed: false, disabled: false },
    ]);
    expect(data?.currentNameOption?.value).toBe(R1);
  });

  it('never offers more than eight names', () => {
    const editor = buildEditor([R1], [R2, R3, R4, R5, R6, R7, R8]);

    const data = useAttachmentPointSelectsData(editor, R1);

    expect(data?.nameOptions).toHaveLength(8);
  });
});
