import { Button, TextField, FormControl } from '@mui/material'
import styled from '@emotion/styled'
import { useState } from 'react'

const FormBox = styled(FormControl)`
  flex-direction: row;
  border-radius: 5px;
  padding: 0 5px 0 5px;
  margin-top: 10px;

  & label,
  button {
    font-size: 13px;
    text-transform: none;
  }
`

const ButtonBox = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const selectHandler = (input) => {
  const arr = input.split(',')
  const numberArr = arr.map((item) => parseInt(item))
  KetcherFunctions.selectAtomsById(numberArr)
}

export const InputSelect = () => {
  const [input, setInput] = useState('')
  const [isError, setError] = useState(false)
  const regex = /^[0-9]+(,[0-9]+)*$/

  const onChangeHandler = (event) => {
    setInput(event.target.value)
    const isInputValid = regex.test(event.target.value)
    setError(!isInputValid)
  }

  return (
    <FormBox>
      <TextField
        error={Boolean(input) && isError}
        helperText="Comma-separated: 1,2,3..."
        id="standard-basic"
        label="Select atoms by ID"
        variant="standard"
        inputProps={{ pattern: regex }}
        value={input}
        onChange={onChangeHandler}
        size="small"
        fullWidth
      />
      <ButtonBox>
        <Button
          disabled={!input || isError}
          variant="contained"
          onClick={() => selectHandler(input)}
          style={{ marginLeft: '10px', height: '30px' }}
          size="small"
        >
          Select
        </Button>
      </ButtonBox>
    </FormBox>
  )
}
