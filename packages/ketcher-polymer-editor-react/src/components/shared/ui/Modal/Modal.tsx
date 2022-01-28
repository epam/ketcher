import { Dialog, Divider, IconButton } from '@mui/material'
import React, { useState } from 'react'
import { Icon } from 'components/shared/ui/icon'
import { css, useTheme } from '@emotion/react'
import styled from '@emotion/styled'

export const Modal = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true)

  const theme = useTheme()

  const ModalHeader = styled('header')`
    margin: 10px 8px 10px 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: ${theme.font.size.medium};
    text-transform: uppercase;
  `

  const Title = styled('div')`
    margin-right: 10px;
  `

  const dividerStyles = css`
    border-color: ${theme.color.divider};
  `

  const ModalBody = styled('div')(() => ({
    margin: '15px'
  }))

  const ModalContainer = styled.div(({ theme }) => ({
    minWidth: '200px',
    color: `${theme.color.text.primary}`
  }))

  const ModalFooter = styled('footer')`
    display: flex;
    align-items: center;
    justify-content: right;
    margin: 0px 15px 10px;
  `

  const subComponentList = Object.keys(Modal)

  const subComponents = subComponentList.map((key) => {
    return React.Children.map(children, (child) =>
      child.type.name === key ? child : null
    )
  })

  const content = subComponents
    .flat()
    .filter((child) => child.type.name === 'Content')
  const footer = subComponents
    .flat()
    .filter((child) => child.type.name === 'Footer')

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} maxWidth="md" onClose={handleClose}>
      <ModalContainer>
        <ModalHeader>
          <Title>{title}</Title>
          <IconButton title={'Close window'} onClick={handleClose}>
            <Icon name={'close'} />
          </IconButton>
        </ModalHeader>
        <Divider css={dividerStyles} />
        <ModalBody>{content}</ModalBody>
        <ModalFooter>{footer}</ModalFooter>
      </ModalContainer>
    </Dialog>
  )
}

const Content = ({ children }) => {
  return <div>{children}</div>
}

const Footer = ({ children }) => {
  return <div>{children}</div>
}

Modal.Content = Content
Modal.Footer = Footer
