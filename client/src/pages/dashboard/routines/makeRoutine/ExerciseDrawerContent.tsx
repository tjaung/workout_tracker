import { useEffect, useMemo, useState } from 'react'
import { exerciseDetailApi, type ExerciseModel } from '@api/exercises/exercise'
import { Button } from '@components/ui/button'
import { Card, CardContent } from '@components/ui/card'
import { Filter } from '@components/ui/filter'
import { Loading } from '@components/ui/loading'
import { Searchbar } from '@components/ui/searchbar'
import { useDrawer } from '@hooks/drawer/useDrawer'
import { makeOptions } from '@utils/helpers/helpers'
import { ExerciseSelectCard } from './ExerciseSelectCard'

export function ExerciseDrawerContent({
  initialSelected,
  onConfirm,
}: {
  initialSelected: ExerciseModel[]
  onConfirm: (exercises: ExerciseModel[]) => void
}) {
  const { closeDrawer } = useDrawer()
  const [exercises, setExercises] = useState<ExerciseModel[]>([])
  const [selectedIds, setSelectedIds] = useState(() => new Set(initialSelected.map((exercise) => exercise.id)))
  const [selectedOrder, setSelectedOrder] = useState(() => initialSelected.map((exercise) => exercise.id))
  const [search, setSearch] = useState('')
  const [exerciseType, setExerciseType] = useState('')
  const [equipment, setEquipment] = useState('')
  const [bodyPart, setBodyPart] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    exerciseDetailApi
      .list({ limit: 500 })
      .then((exerciseList) => {
        if (isMounted) {
          setExercises(exerciseList)
        }
      })
      .catch((caughtError: unknown) => {
        if (isMounted) {
          setError(caughtError instanceof Error ? caughtError.message : 'Unable to load exercises')
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

  const filteredExercises = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    const matchingExercises = exercises.filter((exercise) => {
      const matchesSearch = normalizedSearch
        ? (
          exercise.name.toLowerCase().includes(normalizedSearch)
          || exercise.displayEquipment.toLowerCase().includes(normalizedSearch)
          || exercise.displayBodyParts.toLowerCase().includes(normalizedSearch)
          || exercise.exerciseType.displayName.toLowerCase().includes(normalizedSearch)
        )
        : true
      const matchesType = exerciseType ? exercise.exerciseTypeValue === exerciseType : true
      const matchesEquipment = equipment ? exercise.equipment === equipment : true
      const matchesBodyPart = bodyPart ? exercise.bodyParts.includes(bodyPart) : true

      return matchesSearch && matchesType && matchesEquipment && matchesBodyPart
    })

    const selectedRank = new Map(selectedOrder.map((exerciseId, index) => [exerciseId, index]))
    return [...matchingExercises].sort((firstExercise, secondExercise) => {
      const firstIsSelected = selectedIds.has(firstExercise.id)
      const secondIsSelected = selectedIds.has(secondExercise.id)

      if (firstIsSelected && secondIsSelected) {
        return (selectedRank.get(firstExercise.id) ?? 0) - (selectedRank.get(secondExercise.id) ?? 0)
      }
      if (firstIsSelected) {
        return -1
      }
      if (secondIsSelected) {
        return 1
      }
      return firstExercise.name.localeCompare(secondExercise.name)
    })
  }, [bodyPart, equipment, exerciseType, exercises, search, selectedIds, selectedOrder])

  const exerciseTypeOptions = useMemo(() => makeOptions(
    exercises.map((exercise) => ({
      label: exercise.exerciseType.displayName,
      value: exercise.exerciseTypeValue,
    })),
    'Any type',
  ), [exercises])

  const equipmentOptions = useMemo(() => makeOptions(
    exercises
      .filter((exercise) => exercise.equipment)
      .map((exercise) => ({
        label: exercise.equipment ?? '',
        value: exercise.equipment ?? '',
      })),
    'Any equipment',
  ), [exercises])

  const bodyPartOptions = useMemo(() => makeOptions(
    exercises.flatMap((exercise) => exercise.bodyParts.map((part) => ({
      label: part,
      value: part,
    }))),
    'Any body part',
  ), [exercises])

  const selectedExercises = useMemo(
    () => selectedOrder
      .map((exerciseId) => exercises.find((exercise) => exercise.id === exerciseId))
      .filter((exercise): exercise is ExerciseModel => Boolean(exercise)),
    [exercises, selectedOrder],
  )

  const toggleExercise = (exerciseId: number) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(exerciseId)) {
        next.delete(exerciseId)
      } else {
        next.add(exerciseId)
      }
      return next
    })
    setSelectedOrder((currentOrder) => (
      currentOrder.includes(exerciseId)
        ? currentOrder.filter((selectedId) => selectedId !== exerciseId)
        : [...currentOrder, exerciseId]
    ))
  }

  return (
    <div className="flex min-h-full flex-col gap-5 pt-5">
      <div className="sticky top-0 z-10 -mx-6 border-b border-border bg-surface px-6 pb-4">
        <Searchbar
          aria-label="Search exercises"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search exercises"
          value={search}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Filter
            label="Exercise type"
            onChange={setExerciseType}
            options={exerciseTypeOptions}
            size="sm"
            value={exerciseType}
          />
          <Filter
            label="Equipment"
            onChange={setEquipment}
            options={equipmentOptions}
            size="sm"
            value={equipment}
          />
          <Filter
            label="Body part"
            onChange={setBodyPart}
            options={bodyPartOptions}
            size="sm"
            value={bodyPart}
          />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {selectedIds.size} selected - {filteredExercises.length} shown
          </p>
          <Button
            onClick={() => {
              onConfirm(selectedExercises)
              closeDrawer()
            }}
          >
            Add selected
          </Button>
        </div>
      </div>

      {isLoading ? <Loading label="Loading exercises" size="md" /> : null}

      {error ? (
        <Card>
          <CardContent>
            <p className="text-danger">{error}</p>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading ? (
        <div className="grid gap-3">
          {filteredExercises.length > 0 ? (
            filteredExercises.map((exercise) => (
              <ExerciseSelectCard
                exercise={exercise}
                isSelected={selectedIds.has(exercise.id)}
                key={exercise.id}
                onToggle={() => toggleExercise(exercise.id)}
              />
            ))
          ) : (
            <Card>
              <CardContent>
                <p className="text-muted">No exercises match those filters.</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  )
}
