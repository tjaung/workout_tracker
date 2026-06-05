import { Card, CardContent } from '@components/ui/card'
import { Loading } from '@components/ui/loading'

interface DashboardPlaceholderPageProps {
  title: string
}

export function DashboardPlaceholderPage({ title }: DashboardPlaceholderPageProps) {
  const isPageLoading = false

  if (isPageLoading) {
    return <Loading fullPage label={`Loading ${title.toLowerCase()}`} size="lg" />
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <Card>
        <CardContent className="p-6">
          <p className="text-muted">This section is ready for its first workflow.</p>
        </CardContent>
      </Card>
    </div>
  )
}
