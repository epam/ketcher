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
// import { Scrollable } from 'components/shared/Scrollable'

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
  fontFamily: `${theme.ketcher.font.family.inter}`,
  fontSize: `${theme.ketcher.font.size.medium}`,
  fontWeight: `${theme.ketcher.font.weight.regular}`,
  textTransform: 'uppercase'
}))

const Title = styled.div({
  marginRight: '10px'
})

const Content = styled(DialogContent)({
  margin: '0 16px 16px',
  padding: 0,
  // width: '100%'
  height: '100%',
  // flex: 'none'
  overflow: 'hidden'

  // ...scrollbarThin(theme)
})

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
        background: theme.ketcher.color.background.canvas,
        borderRadius: '8px',
        color: theme.ketcher.color.text.primary
        // width: '100%',
        // height: '100%',
        // overflow: 'hidden'
      }
    }),
    [theme.ketcher.color.text.primary, theme.ketcher.color.background.canvas]
  )

  const backdropProps = useMemo(
    () => ({
      style: {
        background: theme.ketcher.color.background.overlay,
        opacity: 0.4
      }
    }),
    [theme.ketcher.color.background.overlay]
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
      // style={{ width: '100%', height: '100%' }}
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
