import {
  Action,
  AttachmentGroup,
  Atom,
  Bond,
  Struct,
  Vec2,
} from 'ketcher-core';
import {
  ATTACHMENT_GROUP_SPLIT_WARNING,
  getAttachmentGroupIdsSplitByDeletion,
  deleteWithAttachmentGroupSplitConfirm,
  runDeleteWithAttachmentGroupSplitConfirm,
} from './attachmentGroupSplit';
import type Editor from '../Editor';

function createChain() {
  const struct = new Struct();
  const firstAtomId = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(0, 0) }),
  );
  const secondAtomId = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(1, 0) }),
  );
  const thirdAtomId = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(2, 0) }),
  );
  const firstBondId = struct.bonds.add(
    new Bond({ begin: firstAtomId, end: secondAtomId, type: 1 }),
  );
  const secondBondId = struct.bonds.add(
    new Bond({ begin: secondAtomId, end: thirdAtomId, type: 1 }),
  );
  const attachmentGroupId = struct.addAttachmentGroup(
    new AttachmentGroup({
      atomIds: [firstAtomId, secondAtomId, thirdAtomId],
    }),
  );

  return {
    struct,
    firstAtomId,
    secondAtomId,
    thirdAtomId,
    firstBondId,
    secondBondId,
    attachmentGroupId,
  };
}

function createRing() {
  const struct = new Struct();
  const atomIds = [0, 1, 2, 3, 4, 5].map((index) =>
    struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(index, 0) })),
  );
  const bondIds = atomIds.map((atomId, index) =>
    struct.bonds.add(
      new Bond({
        begin: atomId,
        end: atomIds[(index + 1) % atomIds.length],
        type: 1,
      }),
    ),
  );
  const attachmentGroupId = struct.addAttachmentGroup(
    new AttachmentGroup({ atomIds }),
  );

  return { struct, atomIds, bondIds, attachmentGroupId };
}

describe('attachmentGroupSplit', () => {
  describe('getAttachmentGroupIdsSplitByDeletion', () => {
    it('detects deleting a bridging bond of a chain attachment group', () => {
      const { struct, firstBondId, attachmentGroupId } = createChain();

      expect(
        getAttachmentGroupIdsSplitByDeletion(struct, { bonds: [firstBondId] }),
      ).toEqual([attachmentGroupId]);
    });

    it('detects deleting a bridging atom of a chain attachment group', () => {
      const { struct, secondAtomId, attachmentGroupId } = createChain();

      expect(
        getAttachmentGroupIdsSplitByDeletion(struct, { atoms: [secondAtomId] }),
      ).toEqual([attachmentGroupId]);
    });

    it('does not warn when a ring stays connected after deleting one bond', () => {
      const { struct, bondIds } = createRing();

      expect(
        getAttachmentGroupIdsSplitByDeletion(struct, { bonds: [bondIds[0]] }),
      ).toEqual([]);
    });

    it('does not warn when remaining attachment group atoms stay connected', () => {
      const { struct, firstAtomId } = createChain();

      expect(
        getAttachmentGroupIdsSplitByDeletion(struct, { atoms: [firstAtomId] }),
      ).toEqual([]);
    });
  });

  describe('deleteWithAttachmentGroupSplitConfirm', () => {
    it('applies the deletion without a warning when the attachment group stays connected', async () => {
      const { struct } = createRing();
      const confirm = jest.fn();
      const update = jest.fn();
      const applyDeletion = jest.fn(() => new Action());
      const editor = {
        struct: () => struct,
        update,
        event: { confirm: { dispatch: confirm } },
        render: { ctab: {} },
      } as unknown as Editor;

      await expect(
        deleteWithAttachmentGroupSplitConfirm(
          editor,
          { bonds: [0] },
          applyDeletion,
        ),
      ).resolves.toBe(true);

      expect(confirm).not.toHaveBeenCalled();
      expect(applyDeletion).toHaveBeenCalled();
      expect(update).toHaveBeenCalled();
    });

    it('shows a warning and aborts when the user cancels', async () => {
      const { struct, firstBondId } = createChain();
      const confirm = jest.fn().mockRejectedValue(new Error('cancelled'));
      const update = jest.fn();
      const applyDeletion = jest.fn(() => new Action());
      const editor = {
        struct: () => struct,
        update,
        event: { confirm: { dispatch: confirm } },
        render: { ctab: {} },
      } as unknown as Editor;

      await expect(
        deleteWithAttachmentGroupSplitConfirm(
          editor,
          { bonds: [firstBondId] },
          applyDeletion,
        ),
      ).resolves.toBe(false);

      expect(confirm).toHaveBeenCalledWith({
        title: 'Warning!',
        text: ATTACHMENT_GROUP_SPLIT_WARNING,
      });
      expect(applyDeletion).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
    });
  });

  describe('runDeleteWithAttachmentGroupSplitConfirm', () => {
    it('runs onDeleted only after a successful delete', async () => {
      const { struct } = createRing();
      const onDeleted = jest.fn();
      const editor = {
        struct: () => struct,
        update: jest.fn(),
        event: { confirm: { dispatch: jest.fn() } },
        render: { ctab: {} },
      } as unknown as Editor;

      runDeleteWithAttachmentGroupSplitConfirm(
        editor,
        { bonds: [0] },
        () => new Action(),
        onDeleted,
      );

      await Promise.resolve();
      expect(onDeleted).toHaveBeenCalled();
    });

    it('does not run onDeleted when the user cancels', async () => {
      const { struct, firstBondId } = createChain();
      const onDeleted = jest.fn();
      const editor = {
        struct: () => struct,
        update: jest.fn(),
        event: {
          confirm: {
            dispatch: jest.fn().mockRejectedValue(new Error('cancelled')),
          },
        },
        render: { ctab: {} },
      } as unknown as Editor;

      runDeleteWithAttachmentGroupSplitConfirm(
        editor,
        { bonds: [firstBondId] },
        () => new Action(),
        onDeleted,
      );

      await Promise.resolve();
      await Promise.resolve();
      expect(onDeleted).not.toHaveBeenCalled();
    });
  });
});
