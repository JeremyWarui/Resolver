import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useDepartments } from '@/hooks/useDepartments'
import { useServiceCategories } from '@/hooks/useServiceCategories'
import { useServiceItems } from '@/hooks/useServiceItems'
import { useCurrentUser } from '@/contexts/UserDataContext'
import { FacilityLocationSelector } from '@/components/shared/FacilityLocationSelector'
import { DynamicFormRenderer } from '@/components/shared/DynamicFormRenderer'
import ticketsService from '@/api/services/ticketsService'
import type { LocationSelection } from '@/types'
import type { ServiceCategory, ServiceItem, RequestData } from '@/types/catalogue'
import type { Department } from '@/types'

interface TicketCreationWizardProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

type Step = 1 | 2 | 3 | 4 | 5

const STEP_LABELS: Record<Step, string> = {
  1: 'Department',
  2: 'Category',
  3: 'Service',
  4: 'Details',
  5: 'Review',
}

function StepIndicator({ current, total }: { current: Step; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {(Array.from({ length: total }, (_, i) => i + 1) as Step[]).map((s) => (
        <div
          key={s}
          className={`h-1.5 rounded-full transition-all ${
            s < current
              ? 'bg-primary w-4'
              : s === current
                ? 'bg-primary w-6'
                : 'bg-muted w-3'
          }`}
        />
      ))}
    </div>
  )
}

function OptionCard({
  selected,
  onClick,
  title,
  description,
  badge,
}: {
  selected: boolean
  onClick: () => void
  title: string
  description?: string
  badge?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-lg border p-3 transition-colors ${
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/40 hover:bg-muted/40'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
          )}
        </div>
        {badge && (
          <Badge variant="outline" className="text-xs shrink-0">
            {badge}
          </Badge>
        )}
      </div>
    </button>
  )
}

export function TicketCreationWizard({
  isOpen,
  onOpenChange,
  onSuccess,
}: TicketCreationWizardProps) {
  const { userData } = useCurrentUser()

  const [step, setStep] = useState<Step>(1)
  const [department, setDepartment] = useState<Department | null>(null)
  const [category, setCategory] = useState<ServiceCategory | null>(null)
  const [item, setItem] = useState<ServiceItem | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState<LocationSelection>({
    facility: null,
    floor: null,
    room: null,
    location_detail: '',
  })
  const [formData, setFormData] = useState<RequestData>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const campusId = userData?.primary_campus_id ?? null

  const { data: departments, isLoading: depsLoading } = useDepartments(
    campusId != null ? campusId : undefined
  )

  // Use the department ID to load categories — no section step needed.
  // Backend filter: section_type__department=<id> will find all SectionTypes for this Department
  const departmentId = step >= 2 ? (department?.id ?? null) : null
  const { data: categories, isLoading: catsLoading } = useServiceCategories(departmentId)

  const { data: items, isLoading: itemsLoading } = useServiceItems(
    step >= 3 ? (category?.id ?? null) : null
  )

  const canAdvance = useMemo(() => {
    if (step === 1) return department != null
    if (step === 2) return category != null
    if (step === 3) return item != null
    if (step === 4) return title.trim().length >= 3
    return true
  }, [step, department, category, item, title])

  function handleNext() {
    if (!canAdvance) return
    setStep((s) => Math.min(s + 1, 5) as Step)
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 1) as Step)
  }

  function handleDepartmentSelect(dept: Department) {
    if (dept.id !== department?.id) {
      setDepartment(dept)
      setCategory(null)
      setItem(null)
      setFormData({})
    }
  }

  function handleCategorySelect(cat: ServiceCategory) {
    if (cat.id !== category?.id) {
      setCategory(cat)
      setItem(null)
      setFormData({})
    }
  }

  function handleItemSelect(si: ServiceItem) {
    if (si.id !== item?.id) {
      setItem(si)
      setFormData({})
      if (!title && si.name && si.name !== 'Other / General Request') setTitle(si.name)
    }
  }

  function resetWizard() {
    setStep(1)
    setDepartment(null)
    setCategory(null)
    setItem(null)
    setTitle('')
    setDescription('')
    setLocation({ facility: null, floor: null, room: null, location_detail: '' })
    setFormData({})
  }

  function handleOpenChange(open: boolean) {
    if (!open) resetWizard()
    onOpenChange(open)
  }

  async function handleSubmit() {
    if (!department || !item) return
    const missingRequired = item.form_schema.filter(
      (f) => f.required && (formData[f.name] == null || formData[f.name] === '')
    )
    if (missingRequired.length > 0) {
      toast.error(`Required fields missing: ${missingRequired.map((f) => f.label).join(', ')}`)
      return
    }
    setIsSubmitting(true)
    try {
      const result = await ticketsService.createTicketCatalogue({
        department_id: department.id,
        service_item_id: item.id,
        title: title.trim(),
        description: description.trim(),
        facility_id: location.facility,
        location_detail: location.location_detail.trim() || undefined,
        form_data: Object.keys(formData).length > 0 ? (formData as Record<string, unknown>) : null,
      })
      toast.success(`Ticket ${result.ticket.ticket_no} created`)
      resetWizard()
      onOpenChange(false)
      onSuccess?.()
    } catch {
      toast.error('Failed to create ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalSteps = 5

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl w-full flex flex-col p-0 gap-0 h-[85vh]">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="text-base font-semibold">New Request</DialogTitle>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {STEP_LABELS[step]}
              </span>
              <StepIndicator current={step} total={totalSteps} />
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-5 space-y-4">

            {/* Step 1 — Department */}
            {step === 1 && (
              <>
                <p className="text-sm text-muted-foreground">
                  Select the department this request is for.
                </p>
                {depsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
                  </div>
                ) : departments.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No departments available.</p>
                ) : (
                  <div className="space-y-2">
                    {departments.map((dept) => (
                      <OptionCard
                        key={dept.id}
                        selected={dept.id === department?.id}
                        onClick={() => handleDepartmentSelect(dept)}
                        title={dept.name}
                        badge={dept.code}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Step 2 — Category */}
            {step === 2 && (
              <>
                <p className="text-sm text-muted-foreground">
                  What type of service do you need from{' '}
                  <span className="font-medium text-foreground">{department?.name}</span>?
                </p>
                {!department ? (
                  <p className="text-sm text-destructive">
                    This department has no service catalogue configured. Please select a different department or contact admin.
                  </p>
                ) : catsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
                  </div>
                ) : categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No service categories found for this department.</p>
                ) : (
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <OptionCard
                        key={cat.id}
                        selected={cat.id === category?.id}
                        onClick={() => handleCategorySelect(cat)}
                        title={cat.name}
                        description={cat.description}
                        badge={cat.section_type_name}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Step 3 — Service Item */}
            {step === 3 && (
              <>
                <p className="text-sm text-muted-foreground">
                  Select the specific service item.
                </p>
                {itemsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
                  </div>
                ) : items.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No items in this category.</p>
                ) : (
                  <div className="space-y-2">
                    {items.map((si) => (
                      <OptionCard
                        key={si.id}
                        selected={si.id === item?.id}
                        onClick={() => handleItemSelect(si)}
                        title={si.name}
                        description={si.description}
                        badge={
                          si.requires_approval
                            ? 'Requires Approval'
                            : si.sla_hours
                              ? `${si.sla_hours}h SLA`
                              : undefined
                        }
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Step 4 — Details */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief description of the issue"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide any additional context..."
                    rows={3}
                  />
                </div>

                {campusId != null && (
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Location</Label>
                    <FacilityLocationSelector
                      campusId={campusId}
                      value={location}
                      onChange={setLocation}
                    />
                  </div>
                )}

                {item && item.form_schema.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Service Details
                    </p>
                    <DynamicFormRenderer
                      schema={item.form_schema}
                      value={formData}
                      onChange={setFormData}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 5 — Review */}
            {step === 5 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Review your request before submitting.
                </p>

                <dl className="space-y-3 text-sm">
                  <div className="flex gap-2">
                    <dt className="text-muted-foreground w-28 shrink-0">Department</dt>
                    <dd className="font-medium">{department?.name ?? '—'}</dd>
                  </div>
                  {category && (
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground w-28 shrink-0">Category</dt>
                      <dd className="font-medium">{category.name}</dd>
                    </div>
                  )}
                  {item && (
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground w-28 shrink-0">Service</dt>
                      <dd className="font-medium">
                        {item.name}
                        {item.requires_approval && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Requires Approval
                          </Badge>
                        )}
                      </dd>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <dt className="text-muted-foreground w-28 shrink-0">Title</dt>
                    <dd className="font-medium">{title}</dd>
                  </div>
                  {description && (
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground w-28 shrink-0">Description</dt>
                      <dd className="whitespace-pre-wrap">{description}</dd>
                    </div>
                  )}
                  {location.location_detail && (
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground w-28 shrink-0">Location</dt>
                      <dd>{location.location_detail}</dd>
                    </div>
                  )}
                  {Object.keys(formData).length > 0 && (
                    <div className="pt-2 border-t space-y-2">
                      {Object.entries(formData)
                        .filter(([, v]) => v != null && v !== '')
                        .map(([k, v]) => {
                          const fieldDef = item?.form_schema.find((f) => f.name === k)
                          return (
                            <div key={k} className="flex gap-2">
                              <dt className="text-muted-foreground w-28 shrink-0">
                                {fieldDef?.label ?? k}
                              </dt>
                              <dd>{Array.isArray(v) ? v.join(', ') : String(v)}</dd>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </dl>

                {item?.requires_approval && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                    This request requires approval before work begins. It will be submitted for review.
                  </p>
                )}
              </div>
            )}

          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex-shrink-0 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            disabled={step === 1 || isSubmitting}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            {step < 5 ? (
              <Button
                size="sm"
                onClick={handleNext}
                disabled={!canAdvance}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-1.5"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Submit
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
