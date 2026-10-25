import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import type Editor from 'src/script/editor';
import type {
  ItemEventParameters,
  RGroupAttachmentPointContextMenuProperties,
} from '../contextMenu.types';
import { editRGroupAttachmentPoint } from 'src/script/editor/tool/apoint.utils';
import { type Ketcher, ketcherProvider, assert } from 'ketcher-core';

type Parameters_ =
  ItemEventParameters<RGroupAttachmentPointContextMenuProperties>;

const getAtomIdByProperties = (
  properties: RGroupAttachmentPointContextMenuProperties | undefined,
  ketcher: Ketcher,
): number => {
  const editor = ketcher.editor as Editor;
  const restruct = editor.render.ctab;
  const atomId = properties?.atomIds?.[0];
  if (atomId != null) {
    return atomId;
  }

  const attachmentPointId = properties?.rgroupAttachmentPoints?.[0];
  assert(attachmentPointId != null);
  const attachmentPoint =
    restruct.molecule.rgroupAttachmentPoints.get(attachmentPointId);
  assert(attachmentPoint != null);
  return attachmentPoint.atomId;
};

const useRGroupAttachmentPointEdit = () => {
  const { ketcherId } = useAppContext();

  const handler = useCallback(
    ({ props }: Parameters_) => {
      const ketcher = ketcherProvider.getKetcher(ketcherId);
      const restruct = ketcher.editor.render.ctab;
      const atomId = getAtomIdByProperties(props, ketcher);
      const atom = restruct.molecule.atoms.get(atomId);
      assert(atom != null);

      editRGroupAttachmentPoint(ketcher.editor, atom, atomId);
    },
    [ketcherId],
  );

  const disabled = useCallback(
    ({ props }: Parameters_) => {
      const ketcher = ketcherProvider.getKetcher(ketcherId);
      const restruct = ketcher.editor.render.ctab;
      const atomId = getAtomIdByProperties(props, ketcher);
      const atom = restruct.molecule.atoms.get(atomId);
      assert(atom != null);

      return atom.isRGroupAttachmentPointEditDisabled;
    },
    [ketcherId],
  );

  const hidden = useCallback(({ props }: Parameters_) => {
    const atomLength = props?.atomIds?.length ?? 0;
    return atomLength > 1;
  }, []);

  return [handler, disabled, hidden] as const;
};

export default useRGroupAttachmentPointEdit;
