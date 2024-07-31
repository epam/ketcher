import {
  IDTAliasesContainer,
  IDTAliasesList,
  IDTAliasesText,
  IDTTitle,
} from './styles';

interface IDTAliasesProps {
  readonly idtAliasesText: string;
  readonly preset?: boolean;
}

const IDTAliases = ({ idtAliasesText, preset }: IDTAliasesProps) => {
  return (
    <IDTAliasesContainer preset={preset}>
      <IDTAliasesText>
        <IDTTitle>IDT: </IDTTitle>
        <IDTAliasesList>{idtAliasesText}</IDTAliasesList>
      </IDTAliasesText>
    </IDTAliasesContainer>
  );
};

export { IDTAliases };
