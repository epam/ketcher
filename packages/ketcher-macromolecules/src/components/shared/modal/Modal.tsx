import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  Icon,
  KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
  useSettingsPanelDrag,
} from 'ketcher-react';
import { scrollbarThin } from 'theming/mixins';
import { EmptyFunction } from 'helpers/emptyFunction';
import styles from './Modal.module.less';

interface ModalProps {
  children: JSX.Element | Array<JSX.Element>;
  title: React.ReactNode;
  isOpen: boolean;
  showCloseButton?: boolean;
  showExpandButton?: boolean;
  onClose: VoidFunction;
  className?: string;
  modalWidth?: string;
  expanded?: boolean;
  setExpanded?: (boolean) => void;
  testId?: string;
  hideHeaderBorder?: boolean;
  /** Enable drag-to-move and resize-from-border behaviour (same logic as Settings panel). */
  isDraggable?: boolean;
}
const StyledDialog = styled(Dialog)`
  .MuiPaper-root {
    min-width: 304px;
  }
`;

const Header = styled(DialogTitle)<{ hideborder?: boolean }>(
  ({ theme, hideborder }) => ({
    padding: '2px 4px 2px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: `${theme.ketcher.font.family.inter}`,
    fontSize: `${theme.ketcher.font.size.medium}`,
    fontWeight: 500,
    textTransform: 'capitalize',
    borderBottom: hideborder ? 'none' : '1px solid rgba(202, 211, 221, 1)',
  }),
);

const Title = styled.div({
  marginInlineEnd: '10px',
  fontSize: '14px',
});

const StyledIcon = styled(Icon)({
  width: '16px',
  height: '16px',
  color: 'rgba(51, 51, 51, 1)',
});

const Content = styled(DialogContent)`
  padding: 0;
  font-size: ${({ theme }) => theme.ketcher.font.size.medium};
  line-height: 17px;
  color: #000000;
  ${({ theme }) => scrollbarThin(theme)};
`;

interface FooterProps {
  withborder?: string;
}

const Footer = styled(DialogActions)<FooterProps>`
  height: 52px;
  margin: 0;
  padding: 0 12px;
  border-top: ${({ theme, withborder }) =>
    withborder === 'true' ? theme.ketcher.border.small : 'none'};
  justify-content: flex-end;

  .MuiButtonBase-root {
    border-radius: 4px;
    font-size: ${({ theme }) => theme.ketcher.font.size.regular};
  }
`;

type ModalSubcomponent = 'Content' | 'Footer';

export const Modal = ({
  children,
  title,
  isOpen,
  showCloseButton = true,
  showExpandButton = false,
  onClose,
  className,
  modalWidth,
  expanded = false,
  setExpanded = EmptyFunction,
  testId,
  hideHeaderBorder,
  isDraggable = false,
}: ModalProps) => {
  const { t } = useTranslation('macromoleculesDialogs');
  const theme = useTheme();

  // Stable reference to the Ketcher root element used as drag bounds.
  const [containerElement] = useState<HTMLElement | null>(() =>
    document.querySelector<HTMLElement>(
      KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
    ),
  );

  // Ref attached to the MUI Paper so useSettingsPanelDrag can measure/move it.
  const paperRef = useRef<HTMLElement | null>(null);

  const {
    rect,
    setRect,
    startDrag,
    startResizeTop,
    startResizeBottom,
    getBounds,
    setPreferredHeight,
  } = useSettingsPanelDrag({
    panelRef: paperRef,
    boundsElement: isDraggable ? containerElement : null,
    gutter: 0,
  });

  // Centre the paper within the container on first open.
  const hasInitializedRef = useRef(false);

  // MUI Dialog only mounts the Paper when open=true, so we must include isOpen
  // in the deps — the effect fires on mount when the Paper doesn't exist yet.
  useLayoutEffect(() => {
    if (!isDraggable || !isOpen || hasInitializedRef.current) return;
    const paper = paperRef.current;
    if (!paper) return;

    // getBounds() may return null if containerElement wasn't found; fall back
    // to the viewport so the dialog is at least visible and centred.
    const bounds = getBounds() ?? {
      left: 0,
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
    };

    hasInitializedRef.current = true;

    const width = paper.offsetWidth;
    const naturalHeight = paper.scrollHeight;
    const height = Math.min(naturalHeight, bounds.bottom - bounds.top);

    setPreferredHeight(naturalHeight);
    setRect({
      left: bounds.left + (bounds.right - bounds.left - width) / 2,
      top: bounds.top + (bounds.bottom - bounds.top - height) / 2,
      width,
      height,
    });
  }, [isDraggable, isOpen, getBounds, setPreferredHeight, setRect]);

  // Reset positioning when the dialog is closed so a fresh open re-centres it.
  useLayoutEffect(() => {
    if (!isOpen) {
      hasInitializedRef.current = false;
    }
  }, [isOpen]);

  const handleHeaderPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (
        (e.target as Element).closest('button,input,select,a,[role="button"]')
      )
        return;
      startDrag(e);
    },
    [startDrag],
  );

  // Stable ref callback so paperProps doesn't recreate on every rect change
  // (a new callback causes React to call old(null) then new(paper), briefly
  // setting paperRef.current = null mid-commit which confuses the drag hook).
  const setPaperRef = useCallback((node: HTMLElement | null) => {
    paperRef.current = node;
  }, []);

  const paperProps = useMemo(
    () => ({
      ...(testId ? { testid: testId } : {}),
      'data-testid': testId,
      ref: setPaperRef,
      style: {
        background: theme.ketcher.color.background.primary,
        borderRadius: '8px',
        color: theme.ketcher.color.text.primary,
        ...(showExpandButton && {
          margin: 'auto',
          width: expanded ? '100%' : modalWidth,
          height: expanded ? '100%' : undefined,
          maxWidth: 'calc(min(1280px, 100%))',
          maxHeight: 'calc(min(980px, 100%))',
        }),
        // Only apply absolute positioning once rect is known.
        // Before that the Paper stays in MUI's natural centred position so it
        // is always visible (useLayoutEffect will place it before paint).
        ...(isDraggable &&
          rect && {
            position: 'absolute' as const,
            left: rect.left,
            top: rect.top,
            height: rect.height,
          }),
      },
    }),
    [
      testId,
      theme.ketcher.color.background.primary,
      theme.ketcher.color.text.primary,
      showExpandButton,
      expanded,
      modalWidth,
      isDraggable,
      rect,
      setPaperRef,
    ],
  );

  const backdropProps = useMemo(
    () => ({
      style: {
        background: theme.ketcher.color.background.overlay,
        opacity: 0.4,
      },
    }),
    [theme.ketcher.color.background.overlay],
  );

  const subcomponents: Record<ModalSubcomponent, JSX.Element | null> = {
    Content: null,
    Footer: null,
  };

  React.Children.forEach(children, (child) => {
    if (child.type === Content) {
      subcomponents.Content = child;
    } else if (child.type === Footer) {
      subcomponents.Footer = child;
    }
  });

  return (
    <StyledDialog
      BackdropProps={backdropProps}
      PaperProps={paperProps}
      open={isOpen}
      onClose={onClose}
      container={document.querySelector(
        KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
      )}
      disableEscapeKeyDown={!showCloseButton}
      className={className}
      sx={{
        padding: '24px',
        // Remove flex centering from the MUI container so the absolutely-
        // positioned Paper can place itself freely within the dialog root.
        ...(isDraggable && {
          '& .MuiDialog-container': {
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
          },
        }),
      }}
    >
      {isDraggable && (
        <div
          className={styles.resizeHandle}
          onPointerDown={startResizeTop}
          data-testid="dialog-resize-top"
        />
      )}
      {title || showCloseButton || showExpandButton ? (
        <Header
          hideborder={hideHeaderBorder}
          onPointerDown={isDraggable ? handleHeaderPointerDown : undefined}
          className={isDraggable ? styles.draggableHeader : undefined}
        >
          <Title>{title}</Title>
          <span>
            {showExpandButton && (
              <IconButton
                title={
                  expanded ? t('modal.minimizeWindow') : t('modal.expandWindow')
                }
                data-testid={'expand-window-button'}
                className={styles.expandButton}
                onClick={() => {
                  setExpanded(!expanded);
                }}
              >
                <StyledIcon name={expanded ? 'minimize-expansion' : 'expand'} />
              </IconButton>
            )}
            {showCloseButton && (
              <IconButton
                title={t('modal.closeWindow')}
                onClick={onClose}
                data-testid="close-window-button"
              >
                <StyledIcon name={'close'} />
              </IconButton>
            )}
          </span>
        </Header>
      ) : (
        ''
      )}

      {subcomponents.Content}

      {subcomponents.Footer}
      {isDraggable && (
        <div
          className={styles.resizeHandle}
          onPointerDown={startResizeBottom}
          data-testid="dialog-resize-bottom"
        />
      )}
    </StyledDialog>
  );
};

Modal.Content = Content;
Modal.Footer = Footer;
