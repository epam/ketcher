import styled from '@emotion/styled';
import { HTMLAttributes, memo, useEffect, useRef, useState } from 'react';

const Container = styled.div`
  position: relative;
  overflow-y: auto;
`;

const Fader = styled.div<{ scrollTop: number }>`
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: 8px;
  border-radius: inherit;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  ${({ scrollTop }) =>
    scrollTop ? 'box-shadow: 0 2px 5px rgba(103, 104, 132, 0.15);' : null};
  background-color: inherit;
  z-index: ${({ theme }) => theme.ketcher.zIndex.sticky};
`;

const ScrollableFadingContainer = ({
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(
    containerRef?.current?.scrollTop ?? 0,
  );

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = containerRef.current?.scrollTop ?? 0;
      requestAnimationFrame(() => {
        setScrollTop(scrollTop);
      });
    };

    containerRef?.current?.addEventListener('scroll', handleScroll);

    return () => {
      containerRef?.current?.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef]);

  return (
    <Container {...props} ref={containerRef}>
      <Fader scrollTop={scrollTop} />
      {children}
    </Container>
  );
};

export default memo(ScrollableFadingContainer);
