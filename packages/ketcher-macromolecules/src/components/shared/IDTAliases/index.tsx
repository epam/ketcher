import { IKetIdtAliases } from 'ketcher-core';
import { IDTAliasesContainer, IDTAliasesList, IDTTitle } from './styles';

interface IDTAliasesProps {
  readonly aliases: IKetIdtAliases;
  readonly preset?: boolean;
}

const IDTAliases = ({ aliases, preset }: IDTAliasesProps) => {
  let idtAliasesText: string;
  if (aliases.modifications) {
    const modificationsValues = Object.values(aliases.modifications);
    if (modificationsValues.length) {
      idtAliasesText = modificationsValues.join(', ');
    } else {
      idtAliasesText = aliases.base;
    }
  } else {
    idtAliasesText = aliases.base;
  }

  return (
    <IDTAliasesContainer preset={preset}>
      <IDTTitle>IDT: </IDTTitle>
      <IDTAliasesList>{idtAliasesText}</IDTAliasesList>
    </IDTAliasesContainer>
  );
};

export { IDTAliases };
