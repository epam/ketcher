import { Button } from '@mui/material'
import styled from '@emotion/styled'
import LeftLink from './icons/leftLink.svg'
import MiddleLink from './icons/middleLink.svg'
import RightLink from './icons/rightLink.svg'
import { FC, useState } from 'react'

const RAPButton = styled(Button)`
  color: rgba(0, 0, 0, 1);
  padding: 6px 12px;
  border-radius: 8px;
  background-color: ${(props) =>
    props.name ? 'rgba(0, 131, 143, 1)' : 'rgba(242, 242, 242, 1)'};
  min-width: 33px;
  :hover {
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
const buttons = ['R', 'A', 'P']
const svgLinks = [<LeftLink />, <MiddleLink />, <RightLink />]
export const Switcher: FC = () => {
  const [active, setActive] = useState('')

  return (
    <SwitcherContainer>
      <RAPButton>R(A)P</RAPButton>
      <ButtonsContainer>{...svgLinks}</ButtonsContainer>
      <ButtonsContainer>
        {buttons.map((button) => (
          <RAPButton
            key={button}
            onClick={() => setActive(button)}
            name={active === button ? button : ''}
          >
            {button}
          </RAPButton>
        ))}
      </ButtonsContainer>
    </SwitcherContainer>
  )
}
