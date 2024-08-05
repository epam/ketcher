import { Icon } from 'ketcher-react';
import { StyledContent } from 'components/shared/UnresolvedMonomerPreview/styles';

const UnresolvedMonomerPreview = () => {
  return (
    <StyledContent>
      <Icon name="questionMark" />
      Unknown structure
    </StyledContent>
  );
};

export default UnresolvedMonomerPreview;
