import { Card, CardContent } from '@components/ui/card'

export function MetricCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <Card>
      <CardContent className="flex min-h-28 flex-col justify-center gap-1.5 p-3 sm:aspect-square sm:gap-2 sm:p-4">
        <p className="text-[0.65rem] font-medium uppercase leading-tight tracking-[0.12em] text-tertiary sm:text-xs sm:tracking-[0.16em]">{label}</p>
        <p className="text-xl font-semibold leading-tight sm:text-2xl">{value}</p>
      </CardContent>
    </Card>
  )
}
