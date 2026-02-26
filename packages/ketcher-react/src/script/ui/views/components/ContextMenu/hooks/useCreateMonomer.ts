import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import Editor from 'src/script/editor';
import { ketcherProvider } from 'ketcher-core';

const useCreateMonomer = () => {
  const { ketcherId } = useAppContext();

  const handler = useCallback(async () => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
    editor.openMonomerCreationWizard();
  }, [ketcherId]);

  const disabled = useCallback(() => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
    return !editor.isMonomerCreationWizardEnabled;
  }, [ketcherId]);

  return [handler, disabled] as const;
};

export default useCreateMonomer;
