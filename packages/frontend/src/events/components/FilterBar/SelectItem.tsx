import * as Select from '@radix-ui/react-select'
import { cn } from '@/shared/utils/cn'

interface Props {
  value: string
  children: React.ReactNode
}

export function SelectItem({ value, children }: Props) {
  return (
    <Select.Item
      value={value}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded px-3 py-1.5 text-sm',
        'data-[highlighted]:bg-slate-100 data-[highlighted]:outline-none',
        'data-[state=checked]:font-semibold',
      )}
    >
      <Select.ItemText>{children}</Select.ItemText>
    </Select.Item>
  )
}
