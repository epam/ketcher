import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './stateHooks';
import { selectEditor } from 'state/common';
import { IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';
import { getPresets } from 'helpers';
import {
  getCachedCustomRnaPresets,
  setCachedCustomRnaPreset,
} from 'helpers/manipulateCachedRnaPresets';
import {
  clearFavorites,
  setCustomPresets,
  setDefaultPresets,
  setFavoritePresetsFromLocalStorage,
} from 'state/rna-builder';
import {
  loadMonomerLibrary,
  setFavoriteMonomersFromLocalStorage,
} from 'state/library';

function useSetRnaPresets() {
  const dispatch = useAppDispatch();
  const editor = useAppSelector(selectEditor);

  useEffect(() => {
    if (!editor) return;

    const monomersLibrary = editor.monomersLibrary;
    const defaultPresetsTemplates = editor.defaultRnaPresetsLibraryItems;
    const defaultPresets: IRnaPreset[] = [
      ...getPresets(monomersLibrary, defaultPresetsTemplates, true),
    ];
    let customLabeledPresets = getCachedCustomRnaPresets();
    let customPresets: IRnaPreset[] = [];
    const presetsDefaultNames = defaultPresets.map((preset) => preset.name);

    if (customLabeledPresets) {
      // If preset with the same name already exists:
      //   add '_Copy' (again and again) to custom preset, and update in LocalStorage
      for (const customLabeledPreset of customLabeledPresets) {
        let i = 0;
        let presetUniqName = customLabeledPreset.name;

        while (presetsDefaultNames.includes(presetUniqName)) {
          i++;
          presetUniqName = `${customLabeledPreset.name}${'_Copy'.repeat(i)}`;
        }

        if (presetUniqName !== customLabeledPreset.name) {
          setCachedCustomRnaPreset({
            ...customLabeledPreset,
            name: presetUniqName,
          });
        }
      }

      customLabeledPresets = getCachedCustomRnaPresets()!;
      customPresets = getPresets(monomersLibrary, customLabeledPresets);
    }

    dispatch(loadMonomerLibrary(monomersLibrary));
    dispatch(setFavoriteMonomersFromLocalStorage(null));

    dispatch(setDefaultPresets(defaultPresets));
    customLabeledPresets && dispatch(setCustomPresets(customPresets));
    dispatch(setFavoritePresetsFromLocalStorage());

    return () => {
      dispatch(loadMonomerLibrary([]));
      dispatch(clearFavorites());
    };
  }, [editor]);
}

export default useSetRnaPresets;
