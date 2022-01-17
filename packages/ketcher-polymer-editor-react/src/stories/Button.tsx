import styled from '@emotion/styled'

export interface ButtonProps {
  /**
   * Is this the principal call to action on the page?
   */
  primary?: boolean
  /**
   * What background color to use
   */
  backgroundColor?: string
  /**
   * How large should the button be?
   */
  size?: 'small' | 'medium' | 'large'
  /**
   * Button contents
   */
  label: string
  /**
   * Optional click handler
   */
  onClick?: () => void
}

/**
 * Primary UI component for user interaction
 */
const TestButton = ({
  primary = false,
  size = 'medium',
  backgroundColor,
  label,
  ...props
}: ButtonProps) => {
  return (
    <button type="button" style={{ backgroundColor }} {...props}>
      {label}
    </button>
  )
}
export const Button = styled(TestButton)(({ primary, size, theme }) => ({
  fontFamily: [
    'Nunito Sans',
    'Helvetica Neue',
    'Helvetica',
    'Arial',
    'sans-serif'
  ],
  fontWeight: 700,
  border: 0,
  borderRadius: '3em',
  cursor: 'pointer',
  display: 'inline-block',
  lineHeight: 1,
  color: primary ? 'white' : '#333',
  backgroundColor: primary
    ? theme.color?.button.primary.active
    : theme.color?.button.secondary.active,
  boxShadow: !primary ? 'rgba(0, 0, 0, 0.15) 0px 0px 0px 1px inset' : 'none',
  fontSize: size === 'small' ? '12px' : size === 'medium' ? '14px' : '16px',
  padding:
    size === 'small'
      ? '10px 16px'
      : size === 'medium'
      ? '11px 20px'
      : '12px 24px'
}))
