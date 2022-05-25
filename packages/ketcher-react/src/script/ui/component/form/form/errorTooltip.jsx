import { Tooltip } from '@mui/material'
import styled from '@emotion/styled'

export const ErrorTooltip = styled(({ className, title, ...props }) => (
  <Tooltip
    {...props}
    classes={{ popper: className }}
    title={
      <>
        <p style={{ color: 'red' }}>Will work properly if:</p>
        <p>{title}</p>
      </>
    }
  />
))(() => ({
  '.MuiTooltip-tooltip': {
    backgroundColor: '#fff',
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 11
  }
}))
