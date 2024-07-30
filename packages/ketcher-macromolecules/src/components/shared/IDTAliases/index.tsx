import { IDTAliasesContainer, IDTAliasesList, IDTTitle } from './styles';

interface IDTAliasesProps {
  readonly idtAliasesText: string;
  readonly preset?: boolean;
}

const IDTAliases = ({ idtAliasesText, preset }: IDTAliasesProps) => {
  return (
    <IDTAliasesContainer preset={preset}>
      <IDTTitle>IDT: </IDTTitle>
      <IDTAliasesList>{idtAliasesText}</IDTAliasesList>
    </IDTAliasesContainer>
  );
};

export { IDTAliases };
