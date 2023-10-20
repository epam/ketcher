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
    width: 304px;
    background: #ffffff !important;
    border-radius: 4px !important;
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
  letterSpacing: '1.1px',
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
  padding: 10px 12px;
  padding-top: 10px !important;
  font-size: ${({ theme }) => theme.ketcher.font.size.medium};
  letter-spacing: 1.25px;
  line-height: 17px;
  color: #000000;
  ${({ theme }) => scrollbarThin(theme)};
`;

const Footer = styled(DialogActions)`
  height: 52px;
  margin: 0 12px;
  padding: 0;
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
  onClose,
  className,
}: ModalProps) => {
  const theme = useTheme();

  const paperProps = useMemo(
    () => ({
      style: {
        minWidth: '20vw',
        background: theme.ketcher.color.background.canvas,
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
      maxWidth="md"
      onClose={onClose}
      disableEscapeKeyDown={!showCloseButton}
      className={className}
    >
      <Header>
        <Title>{title}</Title>
        {showCloseButton && (
          <IconButton title={'Close window'} onClick={onClose}>
            <StyledIcon name={'close'} />
          </IconButton>
        )}
      </Header>

      {subcomponents.Content}

      {subcomponents.Footer}
    </StyledDialog>
  );
};

Modal.Content = Content;
Modal.Footer = Footer;
