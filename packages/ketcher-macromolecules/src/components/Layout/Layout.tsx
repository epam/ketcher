/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import React, {
  createContext,
  RefObject,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from '@emotion/styled';
import { MONOMER_HIDE_LIBRARY_BUTTON_WIDTH } from 'components/monomerLibrary/styles';
import { useInView } from 'react-intersection-observer';
import { ArrowScroll } from 'ketcher-react';

interface LayoutBoundsContextValue {
  /** The canvas area element — used as portal target for the CanvasCaptureLayer
   *  and as the left/top boundary for floating panels. */
  canvasElement: HTMLElement | null;
  /** The full layout root (canvas + monomers library) — used as portal target
   *  and right/bottom boundary for floating panels. */
  layoutRootElement: HTMLElement | null;
  setCanvasElement: (el: HTMLElement | null) => void;
  setLayoutRootElement: (el: HTMLElement | null) => void;
}

const LayoutBoundsContext = createContext<LayoutBoundsContextValue>({
  canvasElement: null,
  layoutRootElement: null,
  setCanvasElement: () => undefined,
  setLayoutRootElement: () => undefined,
});

/** Wrap the editor root with this provider so both `Layout` and `ModalContainer`
 *  (which is a sibling of `Layout`) share the same bounds context. */
export const LayoutBoundsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [canvasElement, setCanvasElement] = useState<HTMLElement | null>(null);
  const [layoutRootElement, setLayoutRootElement] =
    useState<HTMLElement | null>(null);

  const value = useMemo(
    () => ({
      canvasElement,
      layoutRootElement,
      setCanvasElement,
      setLayoutRootElement,
    }),
    [canvasElement, layoutRootElement],
  );

  return (
    <LayoutBoundsContext.Provider value={value}>
      {children}
    </LayoutBoundsContext.Provider>
  );
};

export function useLayoutBounds(): Pick<
  LayoutBoundsContextValue,
  'canvasElement' | 'layoutRootElement'
> {
  return useContext(LayoutBoundsContext);
}

interface LayoutProps {
  children: JSX.Element | Array<JSX.Element>;
}

const Column = styled.div<{ fullWidth?: boolean; withPaddingRight?: boolean }>(
  ({ fullWidth, withPaddingRight }) => ({
    width: fullWidth ? '100%' : 'fit-content',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingInlineEnd: withPaddingRight ? '12px' : 0,
    overflow: fullWidth ? 'hidden' : 'initial',
  }),
);

const RowMain = styled.div(({ theme }) => ({
  height: '100%',
  width: '100%',
  position: 'relative',
  padding: '12px',
  paddingBottom: 0,
  backgroundColor: theme.ketcher.color.background.canvas,
  display: 'flex',
  justifyContent: 'space-between',
  containerType: 'size',
  overflow: 'clip',
}));

const Row = styled.div(({ theme }) => ({
  height: '100%',
  width: '100%',
  position: 'relative',
  paddingBottom: 0,
  backgroundColor: theme.ketcher.color.background.canvas,
  display: 'flex',
  justifyContent: 'space-between',
  columnGap: '3px',
}));

const BaseLeftRightStyle = styled.div<{ hide?: boolean }>(
  ({ hide = false }) => ({
    height: '100%',
    width: 'fit-content',
    display: hide ? 'none' : 'flex',
    flexDirection: 'column',
  }),
);

const Left = styled(BaseLeftRightStyle)``;

const Right = styled(BaseLeftRightStyle)``;

const StyledTopInnerDiv = styled.div`
  display: flex;
  justify-content: space-between;
  // cqw is used to ensure that the width is calculated based on the container(ketcher root) width, allowing for proper scrolling behavior
  // with 100% width scrollbar does not work properly for some reason
  width: 100cqw;
`;

const StyledTop = styled.div<{ shortened?: boolean }>(
  ({ shortened = false, theme }) => ({
    height: '36px',
    width: shortened
      ? '100%'
      : `calc(100% - ${MONOMER_HIDE_LIBRARY_BUTTON_WIDTH})`,
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    boxShadow: theme.ketcher.shadow.mainLayoutBlocks,
    borderRadius: '4px',
    overflowX: 'hidden',
  }),
);

const StyledArrowScrollWrapper = styled.div`
  width: 42px;
  height: 36px;
  display: flex;
  position: relative;
  inset-inline-end: 0;
  cursor: pointer;
  background: white;
  box-shadow: ${({ theme }) => theme.ketcher.shadow.mainLayoutBlocks};
  border-radius: 4px;
`;

const Bottom = styled.div`
  &:not(:empty) {
    margin-bottom: 15px;
  }
`;

/** Used only as the `data-testid` attribute value on the canvas area for E2E tests. */
export const MACROMOLECULES_MAIN_AREA_TEST_ID = 'macromolecules-main-area';

/** Used only as the `data-testid` attribute value on the layout root for E2E tests. */
const MACROMOLECULES_LAYOUT_ROOT_TEST_ID = 'macromolecules-layout-root';

const Main = styled.div({
  height: '100%',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
});

const InsideRoot = styled.div({});

const DummyDiv = styled.div({
  height: '40px',
});

type LayoutSection =
  'Left' | 'Right' | 'Main' | 'Top' | 'Bottom' | 'InsideRoot';

const Top = (
  props: React.HTMLAttributes<HTMLDivElement> & { shortened?: boolean },
) => {
  const [startRef, startInView] = useInView({ threshold: 1 });
  const [endRef, endInView] = useInView({ threshold: 1 });
  const { children, ...otherProps } = props;
  const scrollRef = useRef(null) as RefObject<HTMLDivElement | null>;

  const SCROLL_PX_PER_SEC = 300;

  const scrollRight = (dtMs: number) => {
    if (!scrollRef.current) {
      return;
    }
    scrollRef.current.scrollLeft += (SCROLL_PX_PER_SEC * dtMs) / 1000;
  };

  const scrollLeft = (dtMs: number) => {
    if (!scrollRef.current) {
      return;
    }
    scrollRef.current.scrollLeft -= (SCROLL_PX_PER_SEC * dtMs) / 1000;
  };

  return (
    <div style={{ display: 'flex', position: 'relative' }}>
      <StyledTop {...otherProps} ref={scrollRef}>
        <span ref={startRef}></span>
        <StyledTopInnerDiv>
          <>{children}</>
        </StyledTopInnerDiv>
        <span ref={endRef}></span>
      </StyledTop>
      {!startInView || !endInView ? (
        <StyledArrowScrollWrapper>
          <ArrowScroll
            startInView={startInView}
            endInView={endInView}
            scrollBack={scrollLeft}
            scrollForward={scrollRight}
            isLeftRight
          />
        </StyledArrowScrollWrapper>
      ) : null}
    </div>
  );
};

export const Layout = ({ children }: LayoutProps) => {
  const { setCanvasElement, setLayoutRootElement } =
    useContext(LayoutBoundsContext);

  const layoutRootCallbackRef = useCallback(
    (el: HTMLDivElement | null) => {
      setLayoutRootElement(el);
    },
    [setLayoutRootElement],
  );

  const canvasCallbackRef = useCallback(
    (el: HTMLDivElement | null) => {
      setCanvasElement(el);
    },
    [setCanvasElement],
  );

  const subcomponents: Record<LayoutSection, JSX.Element | null> = {
    Left: null,
    Main: null,
    Right: null,
    Top: null,
    Bottom: null,
    InsideRoot: null,
  };
  React.Children.forEach(children, (child) => {
    if (child.type === Left) {
      subcomponents.Left = child;
    } else if (child.type === Right) {
      subcomponents.Right = child;
    } else if (child.type === Top) {
      subcomponents.Top = child;
    } else if (child.type === Bottom) {
      subcomponents.Bottom = child;
    } else if (child.type === Main) {
      subcomponents.Main = child;
    } else if (child.type === InsideRoot) {
      subcomponents.InsideRoot = child;
    }
  });

  const mainWithRef = subcomponents.Main
    ? React.cloneElement(
        subcomponents.Main as React.ReactElement<
          React.RefAttributes<HTMLDivElement>
        >,
        { ref: canvasCallbackRef },
      )
    : null;

  return (
    <RowMain
      ref={layoutRootCallbackRef}
      data-testid={MACROMOLECULES_LAYOUT_ROOT_TEST_ID}
    >
      <Column fullWidth withPaddingRight>
        {subcomponents.Top}
        <Row>
          {subcomponents.Left}
          <DummyDiv />
          {mainWithRef}
        </Row>
        {subcomponents.Bottom}
      </Column>
      <Column>{subcomponents.Right}</Column>
      {subcomponents.InsideRoot}
    </RowMain>
  );
};

Layout.Left = Left;
Layout.Top = Top;
Layout.Bottom = Bottom;
Layout.Right = Right;
Layout.Main = Main;
Layout.InsideRoot = InsideRoot;
