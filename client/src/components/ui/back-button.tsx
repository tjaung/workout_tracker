import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from './button'

export function BackButton({
  className = '',
  label = 'Back',
  onClick,
}: {
  className?: string
  label?: string
  onClick?: () => void
}) {
  const navigate = useNavigate()

  return (
    <Button
      className={`self-start ${className}`}
      onClick={onClick ?? (() => navigate(-1))}
      size="sm"
      variant="secondary"
    >
      <ArrowLeft
        aria-hidden="true"
        className="h-4 w-4"
      />
      {label}
    </Button>
  )
}
