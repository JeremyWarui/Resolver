import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { FormSchemaField, RequestData } from '@/types/catalogue'

interface DynamicFormRendererProps {
  schema: FormSchemaField[]
  value: RequestData
  onChange: (data: RequestData) => void
  disabled?: boolean
}

export function DynamicFormRenderer({
  schema,
  value,
  onChange,
  disabled = false,
}: DynamicFormRendererProps) {
  const set = (name: string, val: RequestData[string]) =>
    onChange({ ...value, [name]: val })

  return (
    <div className="space-y-4">
      {schema.map((field) => (
        <div key={field.name} className="space-y-1.5">
          <Label htmlFor={field.name} className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-destructive ml-0.5">*</span>}
          </Label>

          {field.help_text && (
            <p className="text-xs text-muted-foreground">{field.help_text}</p>
          )}

          {field.type === 'text' && (
            <Input
              id={field.name}
              value={(value[field.name] as string) ?? ''}
              onChange={(e) => set(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={disabled}
            />
          )}

          {field.type === 'textarea' && (
            <Textarea
              id={field.name}
              value={(value[field.name] as string) ?? ''}
              onChange={(e) => set(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={disabled}
              rows={3}
            />
          )}

          {field.type === 'number' && (
            <Input
              id={field.name}
              type="number"
              value={(value[field.name] as number | '') ?? ''}
              onChange={(e) =>
                set(field.name, e.target.value === '' ? null : Number(e.target.value))
              }
              placeholder={field.placeholder}
              disabled={disabled}
            />
          )}

          {field.type === 'date' && (
            <Input
              id={field.name}
              type="date"
              value={(value[field.name] as string) ?? ''}
              onChange={(e) => set(field.name, e.target.value)}
              disabled={disabled}
            />
          )}

          {field.type === 'select' && (
            <Select
              value={(value[field.name] as string) ?? ''}
              onValueChange={(val) => set(field.name, val)}
              disabled={disabled}
            >
              <SelectTrigger id={field.name}>
                <SelectValue placeholder={field.placeholder ?? 'Select an option'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {field.type === 'multiselect' && (
            <div className="space-y-2 rounded-md border p-3">
              {field.options?.map((opt) => {
                const current = (value[field.name] as string[]) ?? []
                const checked = current.includes(opt)
                return (
                  <div key={opt} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`${field.name}-${opt}`}
                      checked={checked}
                      disabled={disabled}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...current, opt]
                          : current.filter((x) => x !== opt)
                        set(field.name, next)
                      }}
                      className="h-4 w-4 rounded border-input accent-primary"
                    />
                    <Label
                      htmlFor={`${field.name}-${opt}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {opt}
                    </Label>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
