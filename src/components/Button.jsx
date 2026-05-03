import { motion } from 'framer-motion'

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  fullWidth = false
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'var(--color-primary)',
          color: 'white',
          border: 'none'
        }
      case 'secondary':
        return {
          background: 'transparent',
          color: 'var(--color-primary)',
          border: '1px solid var(--color-primary)'
        }
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--color-muted)',
          border: 'none'
        }
      case 'danger':
        return {
          background: '#dc2626',
          color: 'white',
          border: 'none'
        }
      default:
        return {
          background: 'var(--color-primary)',
          color: 'white',
          border: 'none'
        }
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '8px 16px',
          fontSize: '14px'
        }
      case 'md':
        return {
          padding: '10px 24px',
          fontSize: '16px'
        }
      case 'lg':
        return {
          padding: '12px 32px',
          fontSize: '18px'
        }
      default:
        return {
          padding: '10px 24px',
          fontSize: '16px'
        }
    }
  }

  const baseStyles = {
    borderRadius: '10px',
    transition: 'all 200ms',
    fontWeight: '500',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? '0.5' : '1',
    width: fullWidth ? '100%' : 'auto'
  }

  const hoverStyles = variant === 'primary'
    ? { opacity: '0.9', boxShadow: '0 0 16px rgba(59,108,244,0.4)' }
    : variant === 'ghost'
    ? { background: 'rgba(255,255,255,0.1)' }
    : {}

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.97 }}
      style={{
        ...baseStyles,
        ...getVariantStyles(),
        ...getSizeStyles()
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          Object.assign(e.target.style, hoverStyles)
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          Object.assign(e.target.style, {
            opacity: disabled ? '0.5' : '1',
            boxShadow: 'none',
            background: variant === 'ghost' ? 'transparent' : getVariantStyles().background
          })
        }
      }}
    >
      {children}
    </motion.button>
  )
}

export default Button