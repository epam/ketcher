import { Button } from '@mui/material'
import styled from '@emotion/styled'
import LeftLink from '../../../icons/leftLink.svg'
import MiddleLink from '../../../icons/middleLink.svg'
import RightLink from '../../../icons/rightLink.svg'
import { FC, useState } from 'react'

const RAPButton = styled(Button)<{ isActive: boolean }>`
  color: rgba(0, 0, 0, 1);
  padding: 6px 12px;
  border-radius: 8px;
  background-color: ${(props) =>
    props.isActive ? 'rgba(0, 131, 143, 1)' : 'rgba(242, 242, 242, 1)'};
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
const svgLinks = [LeftLink, MiddleLink, RightLink].map(
  (Component) =>
    // @ts-ignore
    styled(Component)<{ isActive: boolean }>`
      & path {
        stroke-dasharray: ${({ isActive }) => (isActive ? 'none' : '4, 4')};
        stroke: ${({ isActive }) => (isActive ? '#005662' : '#D1D5E3')};
      }
    `
)

export const Switcher: FC = () => {
  const [active, setActive] = useState(3)
  return (
    <SwitcherContainer>
      <RAPButton onClick={() => setActive(3)} isActive={active === 3}>
        R(A)P
      </RAPButton>
      <ButtonsContainer>
        {svgLinks.map((Component, index) => (
          <Component isActive={active === index} />
        ))}
      </ButtonsContainer>
      <ButtonsContainer>
        {buttons.map((button, index) => (
          <RAPButton
            key={button}
            onClick={() => setActive(index)}
            isActive={active === index}
          >
            {button}
          </RAPButton>
        ))}
      </ButtonsContainer>
    </SwitcherContainer>
  )
}
