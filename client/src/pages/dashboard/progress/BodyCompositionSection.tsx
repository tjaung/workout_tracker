import { useMemo, useState } from 'react'
import type { ProgressAggregatePointModel } from '@api/progress'
import { Button } from '@components/ui/button'
import { calculateAge } from '@utils/datetime'
import { get_tdee, round_calories, type BiologicalSex } from '@utils/tdee'
import { ProgressLineChart } from './ProgressLineChart'

type BodyTab = 'weight' | 'bodyFat' | 'tdee'

export function BodyCompositionSection({
  aggregates,
  dateOfBirth,
  sex,
}: {
  aggregates: ProgressAggregatePointModel[]
  dateOfBirth: string
  sex: BiologicalSex
}) {
  const [activeTab, setActiveTab] = useState<BodyTab>('weight')

  const chart = useMemo(() => {
    const x = aggregates.map((aggregate) => aggregate.periodStart)
    if (activeTab === 'bodyFat') {
      return {
        series: [{ name: 'Body fat %', x, y: aggregates.map((aggregate) => aggregate.value('body_fat_percentage')) }],
        yAxisTitle: 'Body fat %',
      }
    }
    if (activeTab === 'tdee') {
      const age = calculateAge(dateOfBirth)
      return {
        series: [{
          name: 'Estimated TDEE',
          x,
          y: aggregates.map((aggregate) => {
            const heightCm = aggregate.value('height_cm')
            const weightKg = aggregate.value('weight_kg')
            if (age === null || heightCm === null || weightKg === null) {
              return null
            }
            return round_calories(get_tdee({
              activityLevel: 'moderate',
              age,
              heightCm,
              sex,
              weightKg,
            }).tdee)
          }),
        }],
        yAxisTitle: 'Calories',
      }
    }
    return {
      series: [{ name: 'Weight kg', x, y: aggregates.map((aggregate) => aggregate.value('weight_kg')) }],
      yAxisTitle: 'Weight kg',
    }
  }, [activeTab, aggregates, dateOfBirth, sex])

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { label: 'Weight', value: 'weight' },
          { label: 'Body fat', value: 'bodyFat' },
          { label: 'TDEE', value: 'tdee' },
        ].map((tab) => (
          <Button
            key={tab.value}
            onClick={() => setActiveTab(tab.value as BodyTab)}
            size="sm"
            variant={activeTab === tab.value ? 'primary' : 'secondary'}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      <ProgressLineChart
        emptyText={activeTab === 'tdee' ? 'TDEE history needs height and weight measurements before it can be charted.' : undefined}
        series={chart.series}
        yAxisTitle={chart.yAxisTitle}
      />
    </div>
  )
}
