import 'overlayscrollbars/css/OverlayScrollbars.css'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import styled from '@emotion/styled'

interface ScrollableProps {
  children: React.ReactNode
  overflowX?: 'hidden' | 'scroll'
  overflowY?: 'hidden' | 'scroll'
}

const StyledOverlayScrollbars = styled(OverlayScrollbarsComponent)(
  ({ theme }) => ({
    height: '100%',
    // width: '100%',
    // maxHeight: 'inherit',
    // height: 'inherit',
    // '& .os-content': {
    // height: '100% !important'
    // },
    '& > .os-scrollbar': {
      margin: '5px',
      width: '4px',
      padding: '0',
      backgroundColor: theme.ketcher.color.scroll.inactive
    },
    '& > .os-scrollbar:hover > .os-scrollbar-track > .os-scrollbar-handle': {
      backgroundColor: theme.ketcher.color.scroll.regular
    },
    '& > .os-scrollbar > .os-scrollbar-track > .os-scrollbar-handle': {
      backgroundColor: theme.ketcher.color.scroll.regular,
      borderRadius: '2px '
    },
    '& > .os-scrollbar > .os-scrollbar-track > .os-scrollbar-handle.active': {
      backgroundColor: theme.ketcher.color.scroll.regular
    },
    '& > .os-scrollbar > .os-scrollbar-track > .os-scrollbar-handle:hover': {
      backgroundColor: theme.ketcher.color.scroll.regular
    }
  })
)

export const Scrollable = ({
  children,
  overflowX = 'scroll',
  overflowY = 'scroll'
}: // ,
// overflowY = 'scroll'
ScrollableProps) => {
  return (
    <StyledOverlayScrollbars
      // className="os-host-flexbox"
      options={{
        scrollbars: {
          clickScrolling: true
        },
        // sizeAutoCapable: false,
        overflowBehavior: {
          x: overflowX,
          y: overflowY
        }
      }}
    >
      {children}
    </StyledOverlayScrollbars>
  )
}
