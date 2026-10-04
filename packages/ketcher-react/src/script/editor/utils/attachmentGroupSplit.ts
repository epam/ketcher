import {
  Action,
  fromAttachmentGroupDeletion,
  KetcherLogger,
  type Struct,
} from 'ketcher-core';
import type Editor from '../Editor';
import type { Selection } from '../Editor';
import { isStructureContinuous } from './structureContinuity';

export const ATTACHMENT_GROUP_SPLIT_WARNING =
  'This action will split the attachment group into disconnected fragments. The attachment group will be removed. Do you want to continue?';

type DeletionSelection = Pick<Selection, 'atoms' | 'bonds'>;

export function getAttachmentGroupIdsSplitByDeletion(
  struct: Struct,
  deletion: DeletionSelection,
): number[] {
  const deletedAtomIds = new Set(deletion.atoms ?? []);
  const deletedBondIds = new Set(deletion.bonds ?? []);

  struct.bonds.forEach((bond, bondId) => {
    if (deletedAtomIds.has(bond.begin) || deletedAtomIds.has(bond.end)) {
      deletedBondIds.add(bondId);
    }
  });

  const splitIds: number[] = [];

  struct.attachmentGroups.forEach((attachmentGroup, attachmentGroupId) => {
    const remainingAtomIds = attachmentGroup.atomIds.filter(
      (atomId) => !deletedAtomIds.has(atomId),
    );
    if (remainingAtomIds.length < 2) {
      return;
    }

    const remainingAtomIdSet = new Set(remainingAtomIds);
    const remainingBondIds: number[] = [];
    struct.bonds.forEach((bond, bondId) => {
      if (deletedBondIds.has(bondId)) {
        return;
      }
      if (
        remainingAtomIdSet.has(bond.begin) &&
        remainingAtomIdSet.has(bond.end)
      ) {
        remainingBondIds.push(bondId);
      }
    });

    if (
      !isStructureContinuous(struct, {
        atoms: remainingAtomIds,
        bonds: remainingBondIds,
      })
    ) {
      splitIds.push(attachmentGroupId);
    }
  });

  return splitIds;
}

export async function deleteWithAttachmentGroupSplitConfirm(
  editor: Editor,
  deletion: DeletionSelection,
  applyDeletion: () => Action,
): Promise<boolean> {
  const splitIds = getAttachmentGroupIdsSplitByDeletion(
    editor.struct(),
    deletion,
  );

  if (splitIds.length > 0) {
    try {
      await editor.event.confirm.dispatch({
        title: 'Warning!',
        text: ATTACHMENT_GROUP_SPLIT_WARNING,
      });
    } catch {
      return false;
    }
  }

  const action = new Action();
  for (const attachmentGroupId of splitIds) {
    if (!editor.struct().attachmentGroups.has(attachmentGroupId)) {
      continue;
    }
    action.mergeWith(
      fromAttachmentGroupDeletion(editor.render.ctab, attachmentGroupId),
    );
  }
  action.mergeWith(applyDeletion());
  editor.update(action);
  return true;
}

/** Sync call sites: confirm/cancel safely, then optionally run a follow-up. */
export function runDeleteWithAttachmentGroupSplitConfirm(
  editor: Editor,
  deletion: DeletionSelection,
  applyDeletion: () => Action,
  onDeleted?: () => void,
): void {
  void deleteWithAttachmentGroupSplitConfirm(editor, deletion, applyDeletion)
    .then((didDelete) => {
      if (didDelete) {
        onDeleted?.();
      }
    })
    .catch((error) => {
      KetcherLogger.error(
        'attachmentGroupSplit.ts::runDeleteWithAttachmentGroupSplitConfirm',
        error,
      );
    });
}
