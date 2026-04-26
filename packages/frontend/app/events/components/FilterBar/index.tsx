import * as Select from '@radix-ui/react-select'
import type { FilterState } from '@/shared/types'
import { cn } from '@/shared/utils'

const STATUSES = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']
const CATEGORIES = ['Music', 'Tech', 'Sports', 'Art', 'Food', 'Business', 'Education']

const ALL = '__all__'

interface Props {
  value: FilterState
  onChange: (next: FilterState) => void
}

export function FilterBar({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="text"
        value={value.search}
        onChange={(e) => onChange({ ...value, search: e.target.value })}
        placeholder="Search title or location…"
        className="w-72 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      <FilterSelect
        label="Status"
        options={STATUSES}
        value={value.status}
        onChange={(v) => onChange({ ...value, status: v })}
      />

      <FilterSelect
        label="Category"
        options={CATEGORIES}
        value={value.category}
        onChange={(v) => onChange({ ...value, category: v })}
      />

      {(value.search || value.status || value.category) && (
        <button
          type="button"
          onClick={() => onChange({ search: '', status: '', category: '' })}
          className="text-sm text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
        >
          Clear
        </button>
      )}
    </div>
  )
}

interface FilterSelectProps {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}

function FilterSelect({ label, options, value, onChange }: FilterSelectProps) {
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

function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
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
