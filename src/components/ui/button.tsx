import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  className = ''
}) => {
  const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] hover:bg-[var(--color-primary-hover)] shadow-sm hover:shadow focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]',
    secondary: 'bg-[var(--color-secondary)] text-[var(--color-secondary-fg)] hover:bg-[var(--color-secondary-hover)] shadow-sm hover:shadow focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]',
    outline: 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]',
    ghost: 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]',
    danger: 'bg-[var(--color-danger)] text-[var(--color-danger-fg)] hover:bg-[var(--color-danger-hover)] shadow-sm hover:shadow focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]'
  }

  const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'h-8 px-3 text-xs rounded-[var(--radius-sm)]',
    md: 'h-10 px-4 text-sm rounded-[var(--radius-md)]',
    lg: 'h-12 px-6 text-base rounded-[var(--radius-lg)]'
  }

  const disabledClasses = disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex gap-2 items-center justify-center select-none font-medium tracking-wide
        transition-all duration-200 active:scale-[.97] focus-visible:outline-none
        ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  )
}