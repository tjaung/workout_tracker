import type { ExerciseModel } from '@api/exercises/exercise'
import { Accordion } from '@components/ui/accordion'
import { Card, CardContent } from '@components/ui/card'

export function ExerciseSelectCard({
  exercise,
  isSelected,
  onToggle,
}: {
  exercise: ExerciseModel
  isSelected: boolean
  onToggle: () => void
}) {
  return (
    <Card className={isSelected ? 'border-primary bg-primary/10' : ''}>
      <CardContent className="p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            checked={isSelected}
            className="mt-1 h-4 w-4 accent-primary"
            onChange={onToggle}
            type="checkbox"
          />
          <span className="min-w-0">
            <span className="block font-medium text-foreground">{exercise.name}</span>
            <span className="mt-1 block text-sm text-muted">
              {exercise.exerciseType.displayName} - {exercise.displayEquipment}
            </span>
            <span className="mt-1 block text-xs text-muted">
              {exercise.displayBodyParts}
            </span>
          </span>
        </label>
      </CardContent>

      <Accordion title="Exercise details">
        <div className="space-y-4 text-sm text-muted">
          <DetailBlock
            label="Body part"
            value={exercise.displayBodyParts}
          />
          <DetailBlock
            label="Preparation"
            value={exercise.preparation}
          />
          <DetailBlock
            label="Execution"
            value={exercise.execution}
          />
        </div>
      </Accordion>
    </Card>
  )
}

function DetailBlock({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-tertiary">
        {label}
      </h3>
      <p className="mt-1 leading-6">{value?.trim() || 'No details available.'}</p>
    </div>
  )
}
