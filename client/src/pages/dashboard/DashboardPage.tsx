import { Card, CardContent } from '@components/ui/card'
import { Loading } from '@components/ui/loading'
import { useAuth } from '@hooks/auth/useAuth'

export function DashboardPage() {
  const { user } = useAuth()
  const isPageLoading = false

  if (isPageLoading) {
    return <Loading fullPage label="Loading dashboard" size="lg" />
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold">User information</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <InfoItem label="Display name" value={user?.displayName} />
            <InfoItem label="Initials" value={user?.initials} />
            <InfoItem label="Username" value={user?.username} />
            <InfoItem label="Email" value={user?.email} />
            <InfoItem label="Created" value={user?.displayCreatedAt} />
            <InfoItem label="Last login" value={user?.displayLastLogin} />
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-md border border-border bg-alabaster-grey p-4">
      <dt className="text-xs font-medium uppercase tracking-[0.16em] text-muted">{label}</dt>
      <dd className="mt-1 text-base font-medium text-foreground">{value ?? '-'}</dd>
    </div>
  )
}
