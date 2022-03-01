import styled from '@emotion/styled'
import { Typography, Button } from '@mui/material'

const backgroundColor = 'white'
const textColor = 'black'

const HeaderBox = styled('div')`
  position: absolute;
  background-color: ${backgroundColor};
  width: calc(100% - 5px);
  border-bottom: 1px dashed gray;
  color: ${textColor};
`

const InnerBox = styled('div')`
  position: relative;
  height: calc(100% - 10px);
  width: 96%;
  margin: 0 auto;
  margin-top: 5px;
  margin-bottom: 5px;
  overflow: hidden;
`

const LowerButton = styled(Button)`
  position: absolute;
  bottom: 10px;
  right: 30px;
  background-color: ${backgroundColor};
  box-shadow: 0px 0px 10px 5px ${backgroundColor};
  &:hover {
    background-color: ${backgroundColor};
  }
`

const TextArea = styled('textarea')`
  font-family: monospace;
  font-size: 14px;
  resize: none;
  display: block;
  margin-top: 30px;
  height: calc(100% - 30px);
  width: 100%;
  border: none;
  outline: none;
  background-color: ${backgroundColor};
  color: ${textColor};
`

export const OutputArea = ({
  outputValue,
  setOutputValue,
}: {
  outputValue: string
  setOutputValue: (string) => void
}) => {
  return (
    // <OuterBox>
    <InnerBox>
      <HeaderBox>
        <Typography>Terminal</Typography>
      </HeaderBox>
      <TextArea value={outputValue} readOnly />
      <LowerButton variant="outlined" onClick={() => setOutputValue('')}>
        Clear Terminal
      </LowerButton>
    </InnerBox>
    // </OuterBox>
  )
}
