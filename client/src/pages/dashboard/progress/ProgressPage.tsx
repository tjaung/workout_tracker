import { useEffect, useState } from 'react'
import {
  progressApi,
  type AggregationPeriod,
  type ProgressAggregatePointModel,
  type ProgressExercisePointModel,
  type ProgressRoutinePointModel,
  type ProgressSummaryModel,
  type ProgressWorkoutPointModel,
} from '@api/progress'
import { Card, CardContent } from '@components/ui/card'
import { Loading } from '@components/ui/loading'
import { useAuth } from '@hooks/auth/useAuth'
import { AnalysisSection } from './AnalysisSection'
import { BodyCompositionSection } from './BodyCompositionSection'
import { ExerciseProgressSection } from './ExerciseProgressSection'
import { MetricCard } from './MetricCard'
import { RoutineTimelineSection } from './RoutineTimelineSection'

export function ProgressPage() {
  const { user } = useAuth()
  const [aggregation, setAggregation] = useState<AggregationPeriod>('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [summary, setSummary] = useState<ProgressSummaryModel | null>(null)
  const [bodyMeasurementAggregates, setBodyMeasurementAggregates] = useState<ProgressAggregatePointModel[]>([])
  const [workouts, setWorkouts] = useState<ProgressWorkoutPointModel[]>([])
  const [routines, setRoutines] = useState<ProgressRoutinePointModel[]>([])
  const [exercises, setExercises] = useState<ProgressExercisePointModel[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState({
    body: true,
    exercise: true,
    routine: true,
    summary: true,
  })

  useEffect(() => {
    const options = { aggregation, endDate: endDate || undefined, startDate: startDate || undefined }
    setError(null)
    setLoading({ body: true, exercise: true, routine: true, summary: true })

    progressApi.summary(options)
      .then(setSummary)
      .catch((caughtError: unknown) => setError(caughtError instanceof Error ? caughtError.message : 'Unable to load progress summary'))
      .finally(() => setLoading((current) => ({ ...current, summary: false })))

    progressApi.aggregateBodyMeasurements(options)
      .then(setBodyMeasurementAggregates)
      .catch((caughtError: unknown) => setError(caughtError instanceof Error ? caughtError.message : 'Unable to load body composition'))
      .finally(() => setLoading((current) => ({ ...current, body: false })))

    Promise.all([progressApi.routines(options), progressApi.workouts(options)])
      .then(([routinePoints, workoutPoints]) => {
        setRoutines(routinePoints)
        setWorkouts(workoutPoints)
      })
      .catch((caughtError: unknown) => setError(caughtError instanceof Error ? caughtError.message : 'Unable to load routine timeline'))
      .finally(() => setLoading((current) => ({ ...current, routine: false })))

    progressApi.exercises(options)
      .then(setExercises)
      .catch((caughtError: unknown) => setError(caughtError instanceof Error ? caughtError.message : 'Unable to load exercise progress'))
      .finally(() => setLoading((current) => ({ ...current, exercise: false })))
  }, [aggregation, endDate, startDate])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      {error ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-danger">{error}</p>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {loading.summary ? (
          <Card className="col-span-2 md:col-span-5"><CardContent className="p-6"><Loading label="Loading stats" size="md" /></CardContent></Card>
        ) : (
          <>
            <MetricCard label="Weight change" value={summary?.displayWeightChange ?? 'Not set'} />
            <MetricCard label="Cumulative workouts" value={String(summary?.cumulativeWorkouts ?? 0)} />
            <MetricCard label="Record changes" value={String(summary?.recordChanges ?? 0)} />
            <MetricCard label="Average duration" value={summary?.displayAverageWorkoutDuration ?? 'Not set'} />
            <MetricCard label="Active days" value={String(summary?.activeDays ?? 0)} />
          </>
        )}
      </section>

      <AnalysisSection
        aggregation={aggregation}
        endDate={endDate}
        isLoading={loading.body}
        onAggregationChange={setAggregation}
        onEndDateChange={setEndDate}
        onStartDateChange={setStartDate}
        startDate={startDate}
        title="Body composition"
      >
        {user ? (
          <BodyCompositionSection
            aggregates={bodyMeasurementAggregates}
            dateOfBirth={user.dateOfBirth}
            sex={user.sex}
          />
        ) : null}
      </AnalysisSection>

      <AnalysisSection
        aggregation={aggregation}
        endDate={endDate}
        isLoading={loading.routine}
        onAggregationChange={setAggregation}
        onEndDateChange={setEndDate}
        onStartDateChange={setStartDate}
        startDate={startDate}
        title="Routine timeline"
      >
        <div className="mb-4 grid grid-cols-2 gap-3 sm:max-w-sm">
          <MetricCard label="Routines started" value={String(summary?.routinesStarted ?? 0)} />
          <MetricCard label="Routines ended" value={String(summary?.routinesEnded ?? 0)} />
        </div>
        <RoutineTimelineSection routines={routines} workouts={workouts} />
      </AnalysisSection>

      <AnalysisSection
        aggregation={aggregation}
        endDate={endDate}
        isLoading={loading.exercise}
        onAggregationChange={setAggregation}
        onEndDateChange={setEndDate}
        onStartDateChange={setStartDate}
        startDate={startDate}
        title="Exercise progress"
      >
        <ExerciseProgressSection
          aggregation={aggregation}
          endDate={endDate}
          exercises={exercises}
          startDate={startDate}
        />
      </AnalysisSection>
    </div>
  )
}
