import { Icon } from 'ketcher-react';
import { StyledContent } from './UnresolvedMonomerPreview.styles';

interface Props {
  testId?: string;
}

const UnresolvedMonomerPreview = ({ testId }: Props) => {
  return (
    <StyledContent data-testid={testId}>
      <Icon name="questionMark" />
      Unknown structure
    </StyledContent>
  );
};

export default UnresolvedMonomerPreview;
