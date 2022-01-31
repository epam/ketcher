import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  useTheme
} from '@mui/material'
import React, { useState, useMemo, useCallback } from 'react'
import { Icon } from 'components/shared/ui/icon'
import styled from '@emotion/styled'

import { scrollbarThin } from 'styles/mixins'

interface ModalProps {
  children: JSX.Element | Array<JSX.Element>
  title: string
}

const ModalHeader = styled(DialogTitle)(({ theme }) => ({
  margin: '10px 8px 10px 15px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: `${theme.font.size.medium}`,
  textTransform: 'uppercase'
}))

const Title = styled.div({
  marginRight: '10px'
})

const Content = styled(DialogContent)(({ theme }) => ({
  margin: '15px',
  ...scrollbarThin(theme)
}))

const Footer = styled(DialogActions)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'right',
  margin: '0px 15px 10px'
})

type ModalSubcomponent = 'Content' | 'Footer'

export const Modal = ({ title, children }: ModalProps) => {
  const [isOpen, setIsOpen] = useState(true)

  const theme = useTheme()

  const paperProps = useMemo(
    () => ({
      style: {
        color: theme.color.text.primary
      }
    }),
    [theme.color.text.primary]
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

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <Dialog
      BackdropProps={backdropProps}
      PaperProps={paperProps}
      open={isOpen}
      maxWidth="md"
      onClose={handleClose}
    >
      <ModalHeader>
        <Title>{title}</Title>
        <IconButton title={'Close window'} onClick={handleClose}>
          <Icon name={'close'} />
        </IconButton>
      </ModalHeader>

      {subcomponents.Content}

      {subcomponents.Footer}
    </Dialog>
  )
}

Modal.Content = Content
Modal.Footer = Footer
