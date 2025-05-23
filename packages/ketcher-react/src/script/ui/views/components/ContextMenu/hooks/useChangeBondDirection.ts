import { useAppContext } from 'src/hooks';
import { fromBondFlipping, ketcherProvider } from 'ketcher-core';

export const useChangeBondDirection = (props) => {
  const { ketcherId } = useAppContext();

  const changeDirection = () => {
    const editor = ketcherProvider.getKetcher(ketcherId)?.editor;
    const bondIds = props.propsFromTrigger?.bondIds || [];
    const bondId = bondIds[0];
    const molecule = editor?.render.ctab.molecule;

    if (!molecule || !bondId) return;

    const bond = molecule.bonds.get(bondId);
    if (!bond) return;

    const action = fromBondFlipping(editor?.render.ctab, bondId);

    editor?.selection(null);
    editor.update(action);
  };

  return { changeDirection };
};
