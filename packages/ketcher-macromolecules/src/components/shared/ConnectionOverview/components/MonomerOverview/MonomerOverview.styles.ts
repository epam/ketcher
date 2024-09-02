import styled from '@emotion/styled';
import { StructRender } from 'ketcher-react';

interface IStyledStyledStructRender {
  isExpanded?: boolean;
}

export const StyledStructRender = styled(
  StructRender,
)<IStyledStyledStructRender>(({ theme, isExpanded }) => ({
  display: 'flex',
  border: `1.5px solid ${theme.ketcher.outline.color}`,
  borderRadius: '6px',
  padding: 5,
  maxHeight: '100%',
  minHeight: '150px',
  height: isExpanded ? 'auto' : '150px',
  width: isExpanded ? 'auto' : '150px',
  alignSelf: 'stretch',
  '& svg': {
    maxWidth: 'fit-content',
    margin: 'auto',
  },
}));

export const AttachmentPointList = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignSelf: 'flex-start',
  width: '100%',
  gap: '7px',
});
