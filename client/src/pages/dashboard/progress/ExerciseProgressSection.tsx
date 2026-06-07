import { useEffect, useMemo, useState } from 'react'
import {
  progressApi,
  type AggregationPeriod,
  type ProgressAggregatePointModel,
  type ProgressExercisePointModel,
} from '@api/progress'
import { SelectField } from '@components/ui/forms'
import { Loading } from '@components/ui/loading'
import { ProgressLineChart } from './ProgressLineChart'

type ExerciseMetric = 'maxWeight' | 'averageWeight' | 'sets' | 'reps' | 'duration'

export function ExerciseProgressSection({
  aggregation,
  endDate,
  exercises,
  startDate,
}: {
  aggregation: AggregationPeriod
  endDate: string
  exercises: ProgressExercisePointModel[]
  startDate: string
}) {
  const exerciseOptions = useMemo(() => {
    const seen = new Map<number, string>()
    exercises.forEach((exercise) => {
      seen.set(exercise.exerciseId, exercise.exerciseName)
    })
    return Array.from(seen.entries()).map(([value, label]) => ({ label, value: String(value) }))
  }, [exercises])
  const [exerciseId, setExerciseId] = useState(() => exerciseOptions[0]?.value ?? '')
  const [metric, setMetric] = useState<ExerciseMetric>('maxWeight')
  const [aggregates, setAggregates] = useState<ProgressAggregatePointModel[]>([])
  const [isLoadingAggregates, setIsLoadingAggregates] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!exerciseId && exerciseOptions[0]) {
      setExerciseId(exerciseOptions[0].value)
    }
  }, [exerciseId, exerciseOptions])

  useEffect(() => {
    if (!exerciseId) {
      setAggregates([])
      return undefined
    }

    let isMounted = true
    setError(null)
    setIsLoadingAggregates(true)

    progressApi.aggregateExercises({
      aggregation,
      endDate: endDate || undefined,
      exerciseId: Number(exerciseId),
      startDate: startDate || undefined,
    })
      .then((points) => {
        if (isMounted) {
          setAggregates(points)
        }
      })
      .catch((caughtError: unknown) => {
        if (isMounted) {
          setError(caughtError instanceof Error ? caughtError.message : 'Unable to load exercise chart')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingAggregates(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [aggregation, endDate, exerciseId, startDate])

  const metricOptions = [
    { label: 'Max weight', value: 'maxWeight' },
    { label: 'Average weight', value: 'averageWeight' },
    { label: 'Sets', value: 'sets' },
    { label: 'Reps', value: 'reps' },
    { label: 'Duration', value: 'duration' },
  ]

  return (
    <div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <SelectField
          label="Exercise"
          onChange={setExerciseId}
          options={exerciseOptions.length > 0 ? exerciseOptions : [{ label: 'No exercises', value: '' }]}
          value={exerciseId}
        />
        <SelectField
          label="Metric"
          onChange={(value) => setMetric(value as ExerciseMetric)}
          options={metricOptions}
          value={metric}
        />
      </div>
      {error ? <p className="mb-3 text-sm font-medium text-danger">{error}</p> : null}
      {isLoadingAggregates ? (
        <Loading label="Loading exercise chart" size="md" />
      ) : (
        <ProgressLineChart
          series={[{
            name: metricOptions.find((option) => option.value === metric)?.label ?? 'Metric',
            x: aggregates.map((aggregate) => aggregate.periodStart),
            y: aggregates.map((aggregate) => valueForMetric(aggregate, metric)),
          }]}
          yAxisTitle={metricOptions.find((option) => option.value === metric)?.label ?? 'Metric'}
        />
      )}
    </div>
  )
}

function valueForMetric(aggregate: ProgressAggregatePointModel, metric: ExerciseMetric) {
  if (metric === 'averageWeight') {
    return aggregate.value('average_weight')
  }
  if (metric === 'sets') {
    return aggregate.value('set_count')
  }
  if (metric === 'reps') {
    return aggregate.value('rep_count')
  }
  if (metric === 'duration') {
    return aggregate.value('total_duration_seconds')
  }
  return aggregate.value('max_weight')
}
