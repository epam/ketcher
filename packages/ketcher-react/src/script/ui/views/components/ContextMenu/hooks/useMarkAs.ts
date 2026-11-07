import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import type Editor from 'src/script/editor';
import { isStructureContinuous } from 'src/script/editor/utils/structureContinuity';
import type {
  SelectionContextMenuProperties,
  ItemEventParameters,
} from '../contextMenu.types';
import { ketcherProvider } from 'ketcher-core';
import {
  type RnaPresetComponentType,
  MonomerCreationMarkAsComponentAction,
} from '../../MonomerCreationWizard/MonomerCreationWizard.constants';

type Parameters_ = ItemEventParameters<SelectionContextMenuProperties>;

const useMarkAs = () => {
  const { ketcherId } = useAppContext();

  const handler = useCallback(
    (componentType: RnaPresetComponentType) => (_parameters: Parameters_) => {
      globalThis.dispatchEvent(
        new CustomEvent<RnaPresetComponentType>(
          MonomerCreationMarkAsComponentAction,
          { detail: componentType },
        ),
      );
    },
    [],
  );

  const isVisible = useCallback(() => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
    if (!editor.isMonomerCreationWizardActive) {
      return false;
    }
    const monomerCreationState = editor.monomerCreationState;

    return monomerCreationState?.isRnaPresetMode;
  }, [ketcherId]);

  const isDisabled = useCallback(() => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
    const selection = editor.selection();
    const struct = editor.struct();

    if (!selection?.atoms || selection.atoms.length === 0) {
      return true;
    }

    // Check if selection is continuous
    const isContinuous = isStructureContinuous(struct, selection);
    return !isContinuous;
  }, [ketcherId]);

  return { handler, isVisible, isDisabled };
};

export default useMarkAs;
