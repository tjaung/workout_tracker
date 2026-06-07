import type { ReactNode } from 'react'
import { Card, CardContent } from '@components/ui/card'
import { DateField, SelectField } from '@components/ui/forms'
import { Loading } from '@components/ui/loading'
import type { AggregationPeriod } from '@api/progress'

export function AnalysisSection({
  aggregation,
  children,
  endDate,
  isLoading = false,
  onAggregationChange,
  onEndDateChange,
  onStartDateChange,
  startDate,
  title,
}: {
  aggregation: AggregationPeriod
  children: ReactNode
  endDate: string
  isLoading?: boolean
  onAggregationChange: (value: AggregationPeriod) => void
  onEndDateChange: (value: string) => void
  onStartDateChange: (value: string) => void
  startDate: string
  title: string
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-tertiary">{title}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
            <DateField label="Start date" onChange={onStartDateChange} value={startDate} />
            <DateField label="End date" onChange={onEndDateChange} value={endDate} />
            <SelectField
              label="Aggregation"
              onChange={(value) => onAggregationChange(value as AggregationPeriod)}
              options={[
                { label: 'Daily', value: 'day' },
                { label: 'Weekly', value: 'week' },
                { label: 'Monthly', value: 'month' },
                { label: 'Yearly', value: 'year' },
              ]}
              value={aggregation}
            />
          </div>
        </div>
        <div className="mt-5">
          {isLoading ? <Loading label={`Loading ${title.toLowerCase()}`} size="md" /> : children}
        </div>
      </CardContent>
    </Card>
  )
}
