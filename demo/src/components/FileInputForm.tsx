import { useState } from 'react'
import styled from '@emotion/styled'

import { PanelButton } from './shared/Buttons'
import { Button } from '@mui/material'

const Form = styled('form')`
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  gap: 10px;

  & label,
  button {
    font-size: 12px;
    text-transform: none;
  }
`

const FileNameBox = styled('div')`
  margin-top: 5px;
  min-height: 18px;
  color: rgba(0, 0, 0, 0.6);
  font-size: 13px;
  text-align: left;
`

const parseFile = (file): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.readAsText(file, 'UTF-8')

    reader.onload = function (evt) {
      const fileContent = evt?.target?.result
      console.log('Parsed file:')
      console.log(fileContent)
      if (typeof fileContent === 'string') {
        resolve(fileContent)
      }
      resolve('')
    }
    reader.onerror = function (err) {
      reject(err)
    }
  })

const submitHandler = (event) => {
  event.preventDefault()
  let file = event.target[0].files[0]

  parseFile(file).then((str) => {
    KetcherFunctions.renderFromCtab(str)
  })
}

interface FileInputProps {
  printToTerminal: (str: string) => void
}

export const FileInputForm = ({ printToTerminal }: FileInputProps) => {
  const [chosenFile, setFile] = useState('')

  const chooseFileHandler = (event) => {
    const file: File = event.target.files[0]
    setFile(file.name)

    parseFile(file).then((str) => {
      let message = 'Selected file content:' + str
      printToTerminal(message)
    })
  }

  return (
    <>
      <Form onSubmit={submitHandler}>
        <Button
          component="label"
          size="small"
          variant="outlined"
          sx={{ marginTop: '10px', lineHeight: '1.3' }}
          fullWidth
        >
          Select file
          <input
            hidden
            type="file"
            name="file-upload"
            onChange={chooseFileHandler}
          />
        </Button>
        <PanelButton
          type="submit"
          variant="contained"
          size="small"
          disabled={!chosenFile}
          fullWidth
        >
          Render file
        </PanelButton>
      </Form>
      <FileNameBox>
        <span>{chosenFile}</span>
      </FileNameBox>
    </>
  )
}
