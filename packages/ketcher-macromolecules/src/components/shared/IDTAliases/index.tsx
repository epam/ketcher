import { IKetIdtAliases } from 'ketcher-core';
import { IDTAliasesContainer } from './styles';

interface IDTAliasesProps {
  readonly aliases: IKetIdtAliases;
}

const IDTAliases = ({ aliases }: IDTAliasesProps) => {
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
    <IDTAliasesContainer>
      IDT: <b>{idtAliasesText}</b>
    </IDTAliasesContainer>
  );
};

export { IDTAliases };
