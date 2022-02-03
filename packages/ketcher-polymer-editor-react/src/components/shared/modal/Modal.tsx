import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton
} from '@mui/material'
import React, { useMemo } from 'react'
import { useTheme } from '@emotion/react'
import styled from '@emotion/styled'
import { Icon } from 'components/shared/icon'
import { scrollbarThin } from 'styles/mixins'

interface ModalProps {
  children: JSX.Element | Array<JSX.Element>
  title: string
  isOpen: boolean
  showCloseButton?: boolean
  onClose?: () => void
}

const Header = styled(DialogTitle)(({ theme }) => ({
  margin: '12px 11px 12px 16px',
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontFamily: `${theme.font.family.inter}`,
  fontSize: `${theme.font.size.medium}`,
  fontWeight: `${theme.font.weight.regular}`,
  textTransform: 'uppercase'
}))

const Title = styled.div({
  marginRight: '10px'
})

const Content = styled(DialogContent)(({ theme }) => ({
  margin: '0 16px 16px',
  padding: 0,

  ...scrollbarThin(theme)
}))

const Footer = styled(DialogActions)({
  margin: '0 16px 16px',
  padding: 0
})

type ModalSubcomponent = 'Content' | 'Footer'

export const Modal = ({
  children,
  title,
  isOpen,
  showCloseButton = true,
  onClose
}: ModalProps) => {
  const theme = useTheme()

  const paperProps = useMemo(
    () => ({
      style: {
        minWidth: '20vw',
        background: theme.color.background.canvas,
        borderRadius: '8px',
        color: theme.color.text.primary
      }
    }),
    [theme.color.text.primary, theme.color.background.canvas]
  )

  const backdropProps = useMemo(
    () => ({
      style: {
        background: theme.color.background.overlay,
        opacity: 0.4
      }
    }),
    [theme.color.background.overlay]
  )

  const subcomponents: Record<ModalSubcomponent, JSX.Element | null> = {
    Content: null,
    Footer: null
  }

  React.Children.forEach(children, (child) => {
    if (child.type === Content) {
      subcomponents.Content = child
    } else if (child.type === Footer) {
      subcomponents.Footer = child
    }
  })

  return (
    <Dialog
      BackdropProps={backdropProps}
      PaperProps={paperProps}
      open={isOpen}
      maxWidth="md"
      onClose={onClose}
      disableEscapeKeyDown={!showCloseButton}
    >
      <Header>
        <Title>{title}</Title>
        {showCloseButton && (
          <IconButton title={'Close window'} onClick={onClose}>
            <Icon name={'close'} />
          </IconButton>
        )}
      </Header>

      {subcomponents.Content}

      {subcomponents.Footer}
    </Dialog>
  )
}

Modal.Content = Content
Modal.Footer = Footer
