import { fromBondsAttrs } from 'ketcher-core';
import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import Editor from 'src/script/editor';
import tools from 'src/script/ui/action/tools';
import { ItemEventParams } from '../contextMenu.types';

const useBondTypeChange = () => {
  const { getKetcherInstance } = useAppContext();
  const handler = useCallback(
    ({ id, props }: ItemEventParams) => {
      const editor = getKetcherInstance().editor as Editor;
      const molecule = editor.render.ctab;
      const bondIds = props?.bondIds || [];
      const bondProps = tools[id].action.opts;
      const isCustomQuery = molecule.bonds.get(bondIds[0])?.b.customQuery;
      if (isCustomQuery) {
        bondProps.customQuery = null;
        bondProps.topology = 0;
        bondProps.reactingCenterStatus = 0;
      }
      editor.update(fromBondsAttrs(molecule, bondIds, bondProps));
    },
    [getKetcherInstance],
  );

  const disabled = useCallback(({ props }: ItemEventParams) => {
    const selectedBondIds = props?.bondIds;
    const editor = getKetcherInstance().editor;

    if (Array.isArray(selectedBondIds) && selectedBondIds.length !== 0) {
      if (editor.struct().isBondFromMacromolecule(selectedBondIds[0])) {
        return true;
      }
      return false;
    }
    return true;
  }, []);

  return [handler, disabled] as const;
};

export default useBondTypeChange;
