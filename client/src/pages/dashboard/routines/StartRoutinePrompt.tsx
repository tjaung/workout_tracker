import { Button } from '@components/ui/button'

export function StartRoutinePrompt({
  setStartNow,
  startNow,
}: {
  setStartNow: (startNow: boolean) => void
  startNow: boolean
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-tertiary">
        Start routine
      </p>
      <h2 className="mt-2 text-2xl font-semibold">Do you want to start this routine today?</h2>
      <div className="mt-6 flex gap-3">
        <Button
          onClick={() => setStartNow(true)}
          size="sm"
          variant={startNow ? 'primary' : 'outline'}
        >
          Yes
        </Button>
        <Button
          onClick={() => setStartNow(false)}
          size="sm"
          variant={!startNow ? 'primary' : 'outline'}
        >
          No
        </Button>
      </div>
    </div>
  )
}
