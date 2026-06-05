import { useEffect, useMemo, useState } from 'react'
import { routineDetailApi, type RoutineDetailModel } from '@api/programming/routine'
import { BackButton } from '@components/ui/back-button'
import { Card, CardContent } from '@components/ui/card'
import { Filter } from '@components/ui/filter'
import { Loading } from '@components/ui/loading'
import { Searchbar } from '@components/ui/searchbar'
import { cn } from '@lib/cn'
import { RoutineBuilderWizard, type RoutineBuilderInitialDraft } from '@pages/dashboard/routines/addRoutine/RoutineBuilderWizard'
import { RoutineSelectCard } from '@pages/dashboard/routines/selectRoutine/RoutineSelectCard'
import { SelectedRoutineDetail } from '@pages/dashboard/routines/selectRoutine/SelectedRoutineDetail'
import {
  daysPerWeekOptions,
  filterRoutines,
  goalOptions,
  intensityOptions,
  routineTypeOptions,
} from './RoutineListPageHelpers'

export function RoutineListPage() {
  const [routines, setRoutines] = useState<RoutineDetailModel[]>([])
  const [search, setSearch] = useState('')
  const [routineType, setRoutineType] = useState('')
  const [goal, setGoal] = useState('')
  const [daysPerWeek, setDaysPerWeek] = useState('')
  const [intensity, setIntensity] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRoutine, setSelectedRoutine] = useState<RoutineDetailModel | null>(null)
  const [transitionRoutine, setTransitionRoutine] = useState<RoutineDetailModel | null>(null)
  const [previousView, setPreviousView] = useState<'list' | 'detail' | null>(null)
  const [direction, setDirection] = useState<'back' | 'next'>('next')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [editingDraft, setEditingDraft] = useState<RoutineBuilderInitialDraft | null>(null)

  useEffect(() => {
    let isMounted = true

    routineDetailApi
      .list({ limit: 500 })
      .then((routineList) => {
        if (isMounted) {
          setRoutines(routineList)
        }
      })
      .catch((caughtError: unknown) => {
        if (isMounted) {
          setError(caughtError instanceof Error ? caughtError.message : 'Unable to load routines')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filteredRoutines = useMemo(() => {
    return filterRoutines({
      daysPerWeek,
      goal,
      intensity,
      routineType,
      routines,
      search,
    })
  }, [daysPerWeek, goal, intensity, routineType, routines, search])

  if (isLoading) {
    return <Loading fullPage label="Loading routines" size="lg" />
  }

  if (editingDraft) {
    return (
      <RoutineBuilderWizard
        eyebrow="Premade routine"
        initialDraft={editingDraft}
        onCancel={() => setEditingDraft(null)}
        title="Edit routine before creating"
      />
    )
  }

  const selectRoutine = (routine: RoutineDetailModel) => {
    if (isTransitioning) {
      return
    }
    setDirection('next')
    setPreviousView('list')
    setTransitionRoutine(routine)
    setSelectedRoutine(routine)
    setIsTransitioning(true)
    window.setTimeout(() => {
      setPreviousView(null)
      setTransitionRoutine(null)
      setIsTransitioning(false)
    }, 300)
  }

  const goBackToList = () => {
    if (isTransitioning) {
      return
    }
    setDirection('back')
    setPreviousView('detail')
    setTransitionRoutine(selectedRoutine)
    setSelectedRoutine(null)
    setIsTransitioning(true)
    window.setTimeout(() => {
      setPreviousView(null)
      setTransitionRoutine(null)
      setIsTransitioning(false)
    }, 300)
  }

  return (
    <div className="relative min-h-[76svh] overflow-hidden">
      {previousView ? (
        <div
          className={cn(
            'absolute inset-0',
            direction === 'next'
              ? 'animate-[routine-step-out-left_300ms_ease-in_forwards]'
              : 'animate-[routine-step-out-right_300ms_ease-in_forwards]',
          )}
        >
          {previousView === 'list' ? (
            <RoutineListView
              error={error}
              filteredRoutines={filteredRoutines}
              goal={goal}
              intensity={intensity}
              onSelect={selectRoutine}
              routineType={routineType}
              search={search}
              setDaysPerWeek={setDaysPerWeek}
              setGoal={setGoal}
              setIntensity={setIntensity}
              setRoutineType={setRoutineType}
              setSearch={setSearch}
              daysPerWeek={daysPerWeek}
            />
          ) : transitionRoutine ? (
            <SelectedRoutineDetail
              onEdit={setEditingDraft}
              onBack={goBackToList}
              routine={transitionRoutine}
            />
          ) : null}
        </div>
      ) : null}

      <div
        className={cn(
          'relative',
          direction === 'next'
            ? 'animate-[routine-step-in-right_300ms_ease-out]'
            : 'animate-[routine-step-in-left_300ms_ease-out]',
        )}
      >
        {selectedRoutine ? (
          <SelectedRoutineDetail
            onEdit={setEditingDraft}
            onBack={goBackToList}
            routine={selectedRoutine}
          />
        ) : (
          <RoutineListView
            error={error}
            filteredRoutines={filteredRoutines}
            goal={goal}
            intensity={intensity}
            onSelect={selectRoutine}
            routineType={routineType}
            search={search}
            setDaysPerWeek={setDaysPerWeek}
            setGoal={setGoal}
            setIntensity={setIntensity}
            setRoutineType={setRoutineType}
            setSearch={setSearch}
            daysPerWeek={daysPerWeek}
          />
        )}
      </div>
    </div>
  )
}

function RoutineListView({
  daysPerWeek,
  error,
  filteredRoutines,
  goal,
  intensity,
  onSelect,
  routineType,
  search,
  setDaysPerWeek,
  setGoal,
  setIntensity,
  setRoutineType,
  setSearch,
}: {
  daysPerWeek: string
  error: string | null
  filteredRoutines: RoutineDetailModel[]
  goal: string
  intensity: string
  onSelect: (routine: RoutineDetailModel) => void
  routineType: string
  search: string
  setDaysPerWeek: (value: string) => void
  setGoal: (value: string) => void
  setIntensity: (value: string) => void
  setRoutineType: (value: string) => void
  setSearch: (value: string) => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <BackButton />

      <section className="flex flex-col gap-4">
        <Searchbar
          aria-label="Search routines"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search routines"
          value={search}
        />

        <div className="grid gap-3 md:grid-cols-4">
          <Filter
            label="Routine type"
            onChange={setRoutineType}
            options={routineTypeOptions}
            value={routineType}
          />
          <Filter
            label="Goal"
            onChange={setGoal}
            options={goalOptions}
            value={goal}
          />
          <Filter
            label="Days per week"
            onChange={setDaysPerWeek}
            options={daysPerWeekOptions}
            value={daysPerWeek}
          />
          <Filter
            label="Intensity"
            onChange={setIntensity}
            options={intensityOptions}
            value={intensity}
          />
        </div>
      </section>

      {error ? (
        <Card>
          <CardContent>
            <p className="text-danger">{error}</p>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4">
        {filteredRoutines.length > 0 ? (
          filteredRoutines.map((routine) => (
            <RoutineSelectCard
              key={routine.id}
              onSelect={() => onSelect(routine)}
              routine={routine}
            />
          ))
        ) : (
          <Card>
            <CardContent>
              <p className="text-muted">No routines match those filters.</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
