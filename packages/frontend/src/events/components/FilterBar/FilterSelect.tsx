import * as Select from '@radix-ui/react-select'
import { cn } from '@/shared/utils/cn'
import { SelectItem } from './SelectItem'

const ALL = '__all__'

interface Props {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}

export function FilterSelect({ label, options, value, onChange }: Props) {
  return (
    <Select.Root
      value={value || ALL}
      onValueChange={(v) => onChange(v === ALL ? '' : v)}
    >
      <Select.Trigger
        className={cn(
          'inline-flex items-center justify-between gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm',
          'min-w-[140px] hover:bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
        )}
      >
        <Select.Value placeholder={label} />
        <Select.Icon className="text-slate-500">▾</Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={4}
          className="z-50 overflow-hidden rounded-md border border-slate-200 bg-white shadow-md"
        >
          <Select.Viewport className="p-1">
            <SelectItem value={ALL}>All {label.toLowerCase()}</SelectItem>
            {options.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
