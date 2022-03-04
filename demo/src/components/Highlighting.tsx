import styled from '@emotion/styled'
import { useState } from 'react'

import { PanelButton } from './shared/Buttons'

type HighlightingProps = { printToTerminal: (string) => void }

const HighlightsBox = styled('div')`
  display: flex;
  justify-content: center;
  flex-direction: column;
`

const ButtonWithColorBox = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ColorInput = styled('input')`
  padding: 0;
  border: none;
  height: 25px;
  width: 25px;
  margin-left: 5px;
  margin-top: 10px;
  background: none;
`

export const Highlighting = ({ printToTerminal }: HighlightingProps) => {
  const [color, setColor] = useState('#FF7F50')

  const colorHandler = (event) => {
    setColor(event.target.value)
  }

  const getAndPrintHighlights = () => {
    const highlights = KetcherFunctions.getAllHighlights()
    printToTerminal(JSON.stringify(highlights, null, 2))
  }

  const createHighlight = () => {
    const { lastHighlightID, lastHighlight } =
      KetcherFunctions.highlightSelection(color)

    if (!lastHighlight) {
      return
    }

    const message =
      'New highlight ID: ' +
      lastHighlightID +
      ', content: \n' +
      JSON.stringify(lastHighlight, null, 2)
    printToTerminal(message)
  }

  return (
    <HighlightsBox>
      <ButtonWithColorBox>
        <ColorInput type="color" value={color} onChange={colorHandler} />
        <PanelButton variant="contained" size="small" onClick={createHighlight}>
          Highlight Selection
        </PanelButton>
        <PanelButton
          variant="outlined"
          size="small"
          onClick={() => KetcherFunctions.clearHighlights()}
        >
          Clear
        </PanelButton>
      </ButtonWithColorBox>
      <PanelButton
        variant="contained"
        size="small"
        onClick={getAndPrintHighlights}
      >
        Get all Highlights
      </PanelButton>
    </HighlightsBox>
  )
}
