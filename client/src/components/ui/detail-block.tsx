export function DetailBlock({
  as = 'div',
  label,
  value,
}: {
  as?: 'div' | 'section'
  label: string
  value: string | null | undefined
}) {
  const Component = as

  return (
    <Component>
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-tertiary">
        {label}
      </h3>
      <p className="mt-1 leading-6">{value?.trim() || 'No details available.'}</p>
    </Component>
  )
}
