import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import React, { useMemo } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Icon } from 'ketcher-react';
import { scrollbarThin } from 'theming/mixins';

interface ModalProps {
  children: JSX.Element | Array<JSX.Element>;
  title: string;
  isOpen: boolean;
  showCloseButton?: boolean;
  onClose: VoidFunction;
  className?: string;
}
const StyledDialog = styled(Dialog)`
  .MuiPaper-root {
    min-width: 304px;
  }
`;

const Header = styled(DialogTitle)(({ theme }) => ({
  padding: '2px 4px 2px 12px;',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontFamily: `${theme.ketcher.font.family.inter}`,
  fontSize: `${theme.ketcher.font.size.medium}`,
  fontWeight: 500,
  textTransform: 'capitalize',
  borderBottom: '1px solid rgba(202, 211, 221, 1)',
}));

const Title = styled.div({
  marginRight: '10px',
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
  ${({ theme }) => scrollbarThin(theme)};
`;

const Footer = styled(DialogActions)`
  height: 52px;
  margin: 0 12px;
  padding: 0;

  .MuiButtonBase-root {
    border-radius: 4px;
    font-size: ${({ theme }) => theme.ketcher.font.size.medium};
  }
`;

type ModalSubcomponent = 'Content' | 'Footer';

export const Modal = ({
  children,
  title,
  isOpen,
  showCloseButton = true,
  onClose,
  className,
}: ModalProps) => {
  const theme = useTheme();

  const paperProps = useMemo(
    () => ({
      style: {
        background: theme.ketcher.color.background.primary,
        borderRadius: '8px',
        color: theme.ketcher.color.text.primary,
      },
    }),
    [theme.ketcher.color.text.primary, theme.ketcher.color.background.canvas],
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
      disableEscapeKeyDown={!showCloseButton}
      className={className}
    >
      {title || showCloseButton ? (
        <Header>
          <Title>{title}</Title>
          {showCloseButton && (
            <IconButton title={'Close window'} onClick={onClose}>
              <StyledIcon name={'close'} />
            </IconButton>
          )}
        </Header>
      ) : (
        ''
      )}

      {subcomponents.Content}

      {subcomponents.Footer}
    </StyledDialog>
  );
};

Modal.Content = Content;
Modal.Footer = Footer;
