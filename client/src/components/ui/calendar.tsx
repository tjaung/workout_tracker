import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@components/ui/button'
import { Card, CardContent } from '@components/ui/card'
import { cn } from '@lib/cn'
import { addMonths, formatDateKey, formatMonth, getCalendarDays } from '@utils/datetime'

export function Calendar({
  eventDateKeys,
  monthCursor,
  onChangeMonth,
  onSelectDate,
  selectedDate,
}: {
  eventDateKeys: Set<string>
  monthCursor: Date
  onChangeMonth: (date: Date) => void
  onSelectDate: (dateKey: string) => void
  selectedDate: string | null
}) {
  const days = getCalendarDays(monthCursor)

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <Button
            aria-label="Previous month"
            onClick={() => onChangeMonth(addMonths(monthCursor, -1))}
            size="sm"
            variant="ghost"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </Button>
          <p className="font-semibold">{formatMonth(monthCursor)}</p>
          <Button
            aria-label="Next month"
            onClick={() => onChangeMonth(addMonths(monthCursor, 1))}
            size="sm"
            variant="ghost"
          >
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-1 text-center text-xs font-medium uppercase text-muted">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dateKey = formatDateKey(day.date)
            const hasEvent = eventDateKeys.has(dateKey)
            const isSelected = selectedDate === dateKey

            return (
              <button
                className={cn(
                  'flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border text-sm transition-colors',
                  day.isCurrentMonth ? 'border-border text-foreground' : 'border-transparent text-muted/60',
                  isSelected ? 'bg-primary text-primary-foreground' : 'hover:border-primary hover:bg-primary/10',
                )}
                key={dateKey}
                onClick={() => onSelectDate(dateKey)}
                type="button"
              >
                <span>{day.date.getDate()}</span>
                <span
                  className={cn(
                    'mt-1 h-1.5 w-1.5 rounded-full',
                    hasEvent ? (isSelected ? 'bg-primary-foreground' : 'bg-primary') : 'bg-transparent',
                  )}
                />
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
