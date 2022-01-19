import { Button } from '@mui/material'
import styled from '@emotion/styled'
// import { useState } from 'react'
import { Icon } from 'components/shared/ui/icon'
import { IconNameType } from 'components/shared/ui/icon/icon'

type SwitcherProps = {
  selectedMonomers: [string, string, string]
  active: number
  handleSetActive: (index: number) => void
}

const RAPButton = styled(Button)<{ 'data-isactive': boolean }>((props) => ({
  padding: '3px 12px',
  backgroundColor: props['data-isactive']
    ? props.theme.color.button.primary.active
    : props.theme.color.background.canvas,
  borderRadius: '8px',
  lineHeight: '18px',
  minWidth: '33px',
  color: props['data-isactive']
    ? props.theme.color.text.light
    : props.theme.color.text.dark,
  ':hover': {
    backgroundColor: props.theme.color.button.primary.hover,
    color: props.theme.color.text.light
  }
}))

const SwitcherContainer = styled('div')`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`
const Container = styled('div')<{ gap: string }>`
  display: flex;
  gap: ${({ gap }) => gap};
`
const svgNames: IconNameType[] = [
  'rap-left-link',
  'rap-middle-link',
  'rap-right-link'
]
const LinkIcon = styled(Icon)<{ 'data-isactive': boolean }>((props) => ({
  fill: 'none',
  '& path': {
    strokeDasharray: props['data-isactive'] ? 'none' : '4,4',
    stroke: props['data-isactive']
      ? props.theme.color.button.primary.active
      : '#D1D5E3'
  }
}))

export const Switcher = ({
  selectedMonomers,
  active,
  handleSetActive
}: SwitcherProps) => {
  const nucleotide =
    selectedMonomers[0] + '(' + selectedMonomers[1] + ')' + selectedMonomers[2]
  return (
    <SwitcherContainer>
      <RAPButton
        onClick={() => handleSetActive(0)}
        data-isactive={active === 0}
      >
        {nucleotide}
      </RAPButton>
      <Container gap="11px">
        {svgNames.map((name, index) => (
          <LinkIcon
            key={name}
            name={name}
            data-isactive={active === index + 1}
          />
        ))}
      </Container>
      <Container gap="4px">
        {selectedMonomers.map((button, index) => (
          <RAPButton
            key={button}
            onClick={() => handleSetActive(index + 1)}
            data-isactive={active === index + 1}
          >
            {button}
          </RAPButton>
        ))}
      </Container>
    </SwitcherContainer>
  )
}
