import { Button } from '@mui/material'
import styled from '@emotion/styled'
import LeftLink from './icons/leftLink.svg'
import MiddleLink from './icons/middleLink.svg'
import RightLink from './icons/rightLink.svg'
// import { useState } from 'react'

const RAPButton = styled(Button)`
  color: rgba(0, 0, 0, 1);
  padding: 6px 12px;
  border-radius: 8px;
  background-color: rgba(242, 242, 242, 1);
  min-width: 33px;
  :hover {
    background-color: rgba(0, 131, 143, 1);
  }
  :active {
    background-color: rgba(0, 131, 143, 1);
  }
`
const SwitcherContainer = styled('div')`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`
const ButtonsContainer = styled('div')`
  display: flex;
  gap: 5px;
`
export const Switcher = () => {
  // const [active, setActive] = useState('kek')

  return (
    <SwitcherContainer>
      <RAPButton>R(A)P</RAPButton>
      <ButtonsContainer>
        <LeftLink />
        <MiddleLink />
        <RightLink />
      </ButtonsContainer>
      <ButtonsContainer>
        <RAPButton>R</RAPButton>
        <RAPButton>A</RAPButton>
        <RAPButton>P</RAPButton>
      </ButtonsContainer>
    </SwitcherContainer>
  )
}
