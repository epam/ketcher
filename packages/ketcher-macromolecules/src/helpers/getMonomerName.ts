import { AmbiguousMonomer, BaseMonomer } from 'ketcher-core';

const getMonomerName = (monomer: BaseMonomer) => {
  if (monomer instanceof AmbiguousMonomer) {
    return `Ambiguous ${monomer.monomerClass}`;
  }

  return monomer.monomerItem.props.Name;
};

export default getMonomerName;
