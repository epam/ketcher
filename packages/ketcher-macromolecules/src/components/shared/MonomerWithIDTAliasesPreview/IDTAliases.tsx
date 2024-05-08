import { IKetIdtAliases } from 'ketcher-core';

interface IDTAliasesProps {
  aliases: IKetIdtAliases;
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
    <span>
      IDT: <b>{idtAliasesText}</b>
    </span>
  );
};

export { IDTAliases };
