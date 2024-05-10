import styled from '@emotion/styled';
import { LoadingCircles } from 'components/modal/Open/AnalyzingFile/LoadingCircles';

const LoadingCirclesWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Loader = () => {
  return (
    <LoadingCirclesWrapper>
      <LoadingCircles />
    </LoadingCirclesWrapper>
  );
};
