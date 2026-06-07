import { useState } from 'react'
import type { ProgressRoutinePointModel, ProgressWorkoutPointModel } from '@api/progress'
import { formatDateKey } from '@utils/datetime'

const palette = ['#bcff00', '#7dd3fc', '#f0abfc', '#facc15', '#86efac', '#c4b5fd']

export function RoutineTimelineSection({
  routines,
  workouts,
}: {
  routines: ProgressRoutinePointModel[]
  workouts: ProgressWorkoutPointModel[]
}) {
  const [tooltip, setTooltip] = useState<{
    content: string
    x: number
    y: number
  } | null>(null)
  const today = new Date()
  const start = new Date(today.getFullYear(), 0, 1)
  const days = Array.from({ length: 371 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return date
  }).filter((date) => date.getFullYear() === today.getFullYear())
  const workoutsByDate = new Map(workouts.map((workout) => [workout.dateKey, workout]))

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[720px] grid-flow-col grid-rows-7 gap-1">
        {days.map((day) => {
          const dateKey = formatDateKey(day)
          const routineIndex = routines.findIndex((routine) => isDateInRoutine(dateKey, routine, today))
          const routine = routineIndex >= 0 ? routines[routineIndex] : null
          const workout = workoutsByDate.get(dateKey)
          const color = routine ? palette[routineIndex % palette.length] : 'transparent'
          const tooltipContent = routine
            ? `${dateKey}\n${routine.name}${workout ? `\n${workout.splitName}: ${workout.tooltip}` : '\nNo workout logged'}`
            : `${dateKey}\nNo active routine`

          return (
            <span
              className="h-3 w-3 rounded-sm border border-border"
              key={dateKey}
              onMouseEnter={(event) => setTooltip({
                content: tooltipContent,
                x: event.clientX,
                y: event.clientY,
              })}
              onMouseLeave={() => setTooltip(null)}
              onMouseMove={(event) => setTooltip((current) => current ? {
                ...current,
                x: event.clientX,
                y: event.clientY,
              } : null)}
              style={{ backgroundColor: color }}
            />
          )
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
        {routines.map((routine, index) => (
          <span className="flex items-center gap-2" key={routine.id}>
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: palette[index % palette.length] }} />
            {routine.name}
          </span>
        ))}
      </div>
      {tooltip ? (
        <div
          className="pointer-events-none fixed z-50 max-w-xs whitespace-pre-line rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground shadow-lg"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y + 12,
          }}
        >
          {tooltip.content}
        </div>
      ) : null}
    </div>
  )
}

function isDateInRoutine(dateKey: string, routine: ProgressRoutinePointModel, today: Date) {
  if (!routine.startDate) {
    return false
  }
  const endDate = routine.endDate ?? formatDateKey(today)
  return dateKey >= routine.startDate && dateKey <= endDate
}
