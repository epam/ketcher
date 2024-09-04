import { memo } from 'react';
import {
  IDTAliasesContainer,
  IDTAliasesList,
  IDTAliasesText,
  IDTTitle,
} from './IDTAliases.styles';

interface IDTAliasesProps {
  readonly idtAliasesText: string;
  readonly preset?: boolean;
}

const IDTAliases = memo(({ idtAliasesText, preset }: IDTAliasesProps) => {
  return (
    <IDTAliasesContainer preset={preset}>
      <IDTAliasesText>
        <IDTTitle>IDT: </IDTTitle>
        <IDTAliasesList>{idtAliasesText}</IDTAliasesList>
      </IDTAliasesText>
    </IDTAliasesContainer>
  );
});

export default IDTAliases;
