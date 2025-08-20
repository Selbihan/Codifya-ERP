import React, { useState, createContext, useContext, ReactNode } from 'react'

interface SelectContextType {
  value: string
  setValue: (val: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = createContext<SelectContextType | undefined>(undefined)

interface SelectProps {
  value?: string
  defaultValue?: string
  onChange?: (val: string) => void
  children: ReactNode
  className?: string
}

export const Select: React.FC<SelectProps> = ({ value, defaultValue, onChange, children, className }) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '')
  const [open, setOpen] = useState(false);
  const actualValue = value !== undefined ? value : internalValue

  const handleChange = (val: string) => {
    setInternalValue(val)
    onChange?.(val)
    setOpen(false);
  }

  // Dışarı tıklanınca kapat
  React.useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.custom-select-root')) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <SelectContext.Provider value={{ value: actualValue, setValue: handleChange, open, setOpen }}>
      <div className={`custom-select-root ${className || ''}`}>{children}</div>
    </SelectContext.Provider>
  )
}

interface SelectTriggerProps {
  children: ReactNode
  className?: string
}
export const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className }) => {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error('SelectTrigger must be used within Select');
  return (
    <div
      className={`border px-3 py-2 rounded cursor-pointer bg-white select-none ${className}`}
      onClick={() => ctx.setOpen(!ctx.open)}
      tabIndex={0}
      role="button"
      aria-haspopup="listbox"
      aria-expanded={ctx.open}
    >
      {children}
    </div>
  );
}

interface SelectContentProps {
  children: ReactNode
  className?: string
}
export const SelectContent: React.FC<SelectContentProps> = ({ children, className }) => {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error('SelectContent must be used within Select');
  if (!ctx.open) return null;
  return (
    <div className={`mt-1 border rounded bg-white shadow-lg z-10 ${className}`}>{children}</div>
  );
}

interface SelectItemProps {
  value: string
  children: ReactNode
  className?: string
}
export const SelectItem: React.FC<SelectItemProps> = ({ value, children, className }) => {
  const ctx = useContext(SelectContext)
  if (!ctx) throw new Error('SelectItem must be used within Select')
  return (
    <div
      className={`px-3 py-2 cursor-pointer hover:bg-blue-100 ${className}`}
      onClick={() => ctx.setValue(value)}
      aria-selected={ctx.value === value}
    >
      {children}
    </div>
  )
}

interface SelectValueProps {
  children?: ReactNode
  className?: string
}
export const SelectValue: React.FC<SelectValueProps> = ({ children, className }) => {
  const ctx = useContext(SelectContext)
  return <span className={className}>{children || ctx?.value}</span>
} 