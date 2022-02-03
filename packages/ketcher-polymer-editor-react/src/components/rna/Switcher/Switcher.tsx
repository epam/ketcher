import { Button } from '@mui/material'
import styled from '@emotion/styled'
import { ReactNode, useState } from 'react'
import { Icon } from 'components/shared/icon'
import { IconNameType } from 'components/shared/icon/icon'
import { css, useTheme } from '@emotion/react'

type SwitcherProps = {
  selectedMonomers: [string, string, string]
  setActiveMonomerType: (type: string) => void
}

type RAPButtonProps = {
  isActive: boolean
  callback: () => void
  children: ReactNode
}

enum Monomers {
  Nucleotide,
  Nucleobase,
  Sugar,
  Phosphate
}

const svgNames: IconNameType[] = [
  'rap-left-link',
  'rap-middle-link',
  'rap-right-link'
]

const RAPButton = ({ isActive, children, callback }: RAPButtonProps) => {
  const { color } = useTheme()
  const styles = css`
    padding: 3px 12px;
    background-color: ${isActive
      ? color.button.primary.active
      : color.background.canvas};
    border-radius: 8px;
    line-height: 18px;
    min-width: 33px;
    color: ${isActive ? color.text.light : color.text.dark};
    :hover {
      background-color: ${color.button.primary.hover};
      color: ${color.text.light};
    }
  `
  return (
    <Button css={styles} onClick={callback}>
      {children}
    </Button>
  )
}

const SwitcherContainer = styled('div')`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`
const SvgContainer = styled('div')`
  display: flex;
  gap: 11px;
`
const ButtonContainer = styled('div')`
  display: flex;
  gap: 4px;
`
const LinkIcon = styled(Icon)<{ isActive: boolean }>(({ isActive, theme }) => ({
  fill: 'none',
  '& path': {
    strokeDasharray: isActive ? 'none' : '4,4',
    stroke: isActive ? theme.color.button.primary.active : '#D1D5E3'
  }
}))

export const Switcher = ({
  selectedMonomers,
  setActiveMonomerType
}: SwitcherProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const handleClick = (type: string, index: number) => {
    setActiveMonomerType(type)
    setActiveIndex(index)
  }
  const [nucleobase, sugar, phosphate] = selectedMonomers
  const nucleotide = `${nucleobase}(${sugar})${phosphate}`

  return (
    <SwitcherContainer>
      <RAPButton
        callback={() => handleClick(Monomers[0], 0)}
        isActive={activeIndex === 0}
      >
        {nucleotide}
      </RAPButton>
      <SvgContainer>
        {svgNames.map((name, index) => (
          <LinkIcon
            key={name}
            name={name}
            isActive={activeIndex === index + 1}
          />
        ))}
      </SvgContainer>
      <ButtonContainer>
        {selectedMonomers.map((button, index) => (
          <RAPButton
            key={button}
            callback={() => handleClick(Monomers[index + 1], index + 1)}
            isActive={activeIndex === index + 1}
          >
            {button}
          </RAPButton>
        ))}
      </ButtonContainer>
    </SwitcherContainer>
  )
}
