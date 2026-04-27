import { cn } from '@/shared/utils/cn'

interface Props {
  children: React.ReactNode
  disabled?: boolean
  onClick: () => void
}

export function PageButton({ children, disabled, onClick }: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'rounded border border-slate-300 bg-white px-3 py-1 text-slate-700 shadow-sm',
        'hover:bg-slate-50',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white',
      )}
    >
      {children}
    </button>
  )
}
