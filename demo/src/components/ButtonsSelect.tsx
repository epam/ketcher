import { useCallback } from 'react'
import {
  Select,
  FormControl,
  MenuItem,
  ListItemText,
  Checkbox,
  SelectChangeEvent
} from '@mui/material'

import { PanelButton as Button } from './shared/Buttons'
import { allButtons, buttonLabelMap } from '../constants/buttons'
import styled from '@emotion/styled'

const ButtonsBox = styled('div')`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`

type ButtonSelectProps = {
  hiddenButtons: string[]
  setHiddenButtons: (arg: string[]) => void
}

export const ButtonsSelect = ({
  hiddenButtons,
  setHiddenButtons
}: ButtonSelectProps) => {
  const handleChange = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const value = event.target.value
      const selectedButtons =
        typeof value === 'string' ? value.split(',') : value
      const hiddenButtons = getHiddenButtons(selectedButtons)
      setHiddenButtons(hiddenButtons)
    },
    [setHiddenButtons]
  )

  const hideAllButtons = useCallback(() => {
    setHiddenButtons(allButtons)
  }, [setHiddenButtons])

  const showAllButtons = useCallback(() => {
    setHiddenButtons([])
  }, [setHiddenButtons])

  return (
    <FormControl>
      <Select
        multiple
        displayEmpty
        value={getVisibleButtons(hiddenButtons)}
        renderValue={() => 'Choose Buttons to Show/Hide'}
        onChange={handleChange}
        size="small"
        sx={{ marginTop: '10px', fontSize: '13px' }}
      >
        {allButtons.map((buttonKey) => (
          <MenuItem key={buttonKey} value={buttonKey}>
            <Checkbox checked={hiddenButtons.indexOf(buttonKey) < 0} />
            <ListItemText primary={buttonLabelMap[buttonKey]} />
          </MenuItem>
        ))}
      </Select>
      <ButtonsBox>
        <Button
          size="small"
          variant="outlined"
          onClick={hideAllButtons}
          fullWidth
        >
          Hide All
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={showAllButtons}
          fullWidth
        >
          Show All
        </Button>
      </ButtonsBox>
    </FormControl>
  )
}

function getVisibleButtons(hiddenButtons: string[]) {
  const visibleButtons = allButtons.filter(
    (button) => !hiddenButtons.includes(button)
  )
  return visibleButtons
}

function getHiddenButtons(visibleButtons: string[]) {
  const hiddenButtons = allButtons.filter(
    (button) => !visibleButtons.includes(button)
  )
  return hiddenButtons
}
