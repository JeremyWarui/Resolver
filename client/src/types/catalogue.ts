export type FormFieldType = 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'date'

export interface FormSchemaField {
  name: string
  label: string
  type: FormFieldType
  required: boolean
  options?: string[]
  placeholder?: string
  help_text?: string
}

export interface ServiceCategory {
  id: number
  section_type: number
  section_type_name: string
  name: string
  description: string
  icon: string
  order: number
  is_active: boolean
  service_items?: ServiceItem[]
}

export interface ServiceItem {
  id: number
  category: number
  category_name: string
  name: string
  description: string
  default_priority: 'low' | 'medium' | 'high' | 'critical'
  sla_hours: number | null
  requires_approval: boolean
  form_schema: FormSchemaField[]
  is_active: boolean
  order: number
  request_count: number
}

export type RequestData = Record<string, string | string[] | number | null>
