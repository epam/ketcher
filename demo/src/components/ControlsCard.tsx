import { ReactNode } from 'react'
import styled from '@emotion/styled'
import { Typography } from '@mui/material'

const ControlsBox = styled('div')`
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 255px;
`

const PanelHeader = styled(Typography)`
  color: rgba(0, 0, 0, 0.6);
  font-weight: bold;
  margin-top: 20px;
`

interface ControlsCardProps {
  cardName: string
  children: ReactNode
}

export const ControlsCard = ({ cardName, children }: ControlsCardProps) => {
  return (
    <ControlsBox>
      <PanelHeader variant="body1">{cardName}</PanelHeader>
      {children}
    </ControlsBox>
  )
}
