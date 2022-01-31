import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  useTheme
} from '@mui/material'
import React, { useMemo, useCallback } from 'react'
import { Icon } from 'components/shared/ui/icon'
import styled from '@emotion/styled'

import { scrollbarThin } from 'styles/mixins'

interface ModalProps {
  children: JSX.Element | Array<JSX.Element>
  title: string
  isModalOpen: boolean
  setIsModalOpen: (isOpen: boolean) => void
}

const ModalHeader = styled(DialogTitle)(({ theme }) => ({
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
  title,
  isModalOpen,
  setIsModalOpen,
  children
}: ModalProps) => {
  const theme = useTheme()

  const paperProps = useMemo(
    () => ({
      style: {
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

  const handleClose = useCallback(() => {
    setIsModalOpen(false)
  }, [setIsModalOpen])

  return (
    <Dialog
      BackdropProps={backdropProps}
      PaperProps={paperProps}
      open={isModalOpen}
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
