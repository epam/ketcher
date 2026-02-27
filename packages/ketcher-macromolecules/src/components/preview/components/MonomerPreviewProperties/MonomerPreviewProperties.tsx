import {
  MonomerPreviewContainer,
  MonomerPreviewList,
  MonomerPreviewText,
  MonomerPreviewTitle,
} from './MonomerPreviewProperties.styles';

type RowItem = { label: string; text: string };

interface MonomerPreviewProps {
  readonly idtAliasesText?: string;
  readonly axoLabsText?: string;
  readonly helmText?: string;
  readonly modificationTypeText?: string;
  readonly preset?: boolean;
}

export default function MonomerPreviewProperties({
  idtAliasesText,
  axoLabsText,
  helmText,
  modificationTypeText,
  preset,
}: MonomerPreviewProps) {
  const rows: RowItem[] = [
    ...(idtAliasesText ? [{ label: 'IDT', text: idtAliasesText }] : []),
    ...(axoLabsText ? [{ label: 'AxoLabs', text: axoLabsText }] : []),
    ...(helmText ? [{ label: 'HELM', text: helmText }] : []),
    ...(modificationTypeText
      ? [{ label: 'Modification type', text: modificationTypeText }]
      : []),
  ];

  if (!rows.length) return null;

  return (
    <MonomerPreviewContainer preset={preset}>
      {rows.map((item) => (
        <MonomerPreviewText key={item.label}>
          <MonomerPreviewTitle>{item.label}:</MonomerPreviewTitle>
          <MonomerPreviewList>{item.text}</MonomerPreviewList>
        </MonomerPreviewText>
      ))}
    </MonomerPreviewContainer>
  );
}
