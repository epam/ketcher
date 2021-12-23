import MuiButton, { ButtonBaseProps } from '@mui/material/ButtonBase'
import styled from '@emotion/styled'

// @TODO: use theme when implemented
const Button = styled(MuiButton)`
  background-color: #005662;
  color: white;
  padding: 5px 16px;
  border: none;
  border-radius: 2px;
  text-transform: none;
  line-height: 14px;
  font-size: 12px;
  text-align: center;

  &:hover {
    background-color: #00838f;
  }

  &:disabled {
    background: rgba(0, 131, 143, 0.4);
    opacity: 0.4;
  }
`

type ActionButtonProps = {
  label: string
  clickHandler: () => void
} & ButtonBaseProps

export const ActionButton = ({
  label,
  clickHandler,
  ...rest
}: ActionButtonProps) => {
  return (
    <Button
      onClick={clickHandler}
      title={rest.title || label}
      role="button"
      {...rest}>
      {label}
    </Button>
  )
}
