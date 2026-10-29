import { useTranslation } from 'react-i18next';
import { Icon } from 'ketcher-react';
import { StyledContent } from './UnresolvedMonomerPreview.styles';

interface Props {
  testId?: string;
}

const UnresolvedMonomerPreview = ({ testId }: Props) => {
  const { t } = useTranslation('macromolecules');
  return (
    <StyledContent data-testid={testId}>
      <Icon name="questionMark" />
      {t('preview.unknownStructure')}
    </StyledContent>
  );
};

export default UnresolvedMonomerPreview;
