import { useAppSelector } from 'hooks';
import { selectShowPreview } from 'state/common';
import { TextPreviewState } from 'state/types';
import { Container } from './TextPreview.styles';

const TextPreview = () => {
  const preview = useAppSelector(selectShowPreview) as TextPreviewState;

  return <Container data-testid="text-preview">{preview.text}</Container>;
};

export default TextPreview;
