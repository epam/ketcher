import { useAppContext } from 'src/hooks';

export const useChangeBondDirection = (props) => {
  const { getKetcherInstance } = useAppContext();

  const changeDirection = () => {
    const editor = getKetcherInstance()?.editor;
    const bondIds = props.propsFromTrigger?.bondIds || [];
    const bondId = bondIds[0];
    const molecule = editor?.render.ctab.molecule;

    if (!molecule || !bondId) return;

    const bond = molecule.bonds.get(bondId);
    if (!bond) return;

    const atomBegin = bond.begin;
    const atomEnd = bond.end;

    bond.begin = atomEnd;
    bond.end = atomBegin;

    editor.update(true);
  };

  return { changeDirection };
};
