import styled from '@emotion/styled';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 16px;
  padding: 8px;
  background: #ffffff;
  border: 1px solid #cad3dd;
  border-radius: 4px;
  box-shadow: 0px 1px 1px rgba(197, 203, 207, 0.7);
`;

export const Header = styled.div`
  font-weight: 600;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ContentLine = styled.div`
  height: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
`;

interface RatioBarProps {
  ratio: number;
}

export const RatioBar = styled.div<RatioBarProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 36px;
  border-right: 0.5px solid #b4b9d6;
  background: ${({ ratio }) => `linear-gradient(
    90deg,
    #ffffff 0%,
    #ffffff ${100 - ratio}%,
    #e7f7ea ${100 - ratio + 0.5}%,
    #e7f7ea 100%
  )`};
`;

export const MonomerName = styled.div`
  flex: 1;
`;
