import { useCallback } from 'react';
import {
  canCreateSAPFromSelection,
  fromSAPAddition,
  ketcherProvider,
} from 'ketcher-core';
import { useAppContext } from 'src/hooks';
import Editor from 'src/script/editor';

const useCreateSuperAttachmentPoint = () => {
  const { ketcherId } = useAppContext();

  const handler = useCallback(() => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
    const sel = editor.selection();
    const atomIds = sel?.atoms ?? [];
    const check = canCreateSAPFromSelection(editor.render.ctab.molecule, {
      atoms: atomIds,
      bonds: sel?.bonds ?? [],
    });
    if (!check.ok) {
      editor.errorHandler?.(check.reason);
      return;
    }
    const { action } = fromSAPAddition(editor.render.ctab, atomIds);
    editor.update(action);
  }, [ketcherId]);

  const disabled = useCallback(() => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
    if (!editor) return true;
    const sel = editor.selection();
    return !canCreateSAPFromSelection(editor.render.ctab.molecule, {
      atoms: sel?.atoms ?? [],
      bonds: sel?.bonds ?? [],
    }).ok;
  }, [ketcherId]);

  return [handler, disabled] as const;
};

export default useCreateSuperAttachmentPoint;
