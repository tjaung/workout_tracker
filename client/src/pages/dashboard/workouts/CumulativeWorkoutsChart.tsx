import { useEffect, useRef } from 'react'
import type { WorkoutHistoryItemModel } from '@api/workouts'
import { Card, CardContent } from '@components/ui/card'

export function CumulativeWorkoutsChart({ workouts }: { workouts: WorkoutHistoryItemModel[] }) {
  const chartRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!chartRef.current) {
      return undefined
    }

    const chartElement = chartRef.current
    let isCancelled = false
    let handleResize: (() => void) | null = null

    void import('plotly.js-dist-min').then(({ default: Plotly }) => {
      if (isCancelled) {
        return
      }

      const sortedWorkouts = [...workouts].sort((left, right) => left.startTime.localeCompare(right.startTime))
      const styles = getComputedStyle(document.documentElement)
      const foreground = styles.getPropertyValue('--color-foreground').trim()
      const border = styles.getPropertyValue('--color-border').trim()
      const surface = styles.getPropertyValue('--color-surface').trim()
      const primary = styles.getPropertyValue('--color-primary').trim()

      const x = sortedWorkouts.map((workout) => workout.startTime)
      const y = sortedWorkouts.map((_workout, index) => index + 1)
      const text = sortedWorkouts.map((workout) => workout.hoverSummary)

      void Plotly.react(
        chartElement,
        [
          {
            hovertemplate: '%{text}<extra></extra>',
            line: {
              color: primary,
              shape: 'hv',
              width: 3,
            },
            marker: {
              color: primary,
              line: {
                color: surface,
                width: 2,
              },
              size: 8,
            },
            mode: 'lines+markers',
            text,
            type: 'scatter',
            x,
            y,
          },
        ],
        {
          autosize: true,
          font: {
            color: foreground,
            family: 'inherit',
          },
          hoverlabel: {
            bgcolor: surface,
            bordercolor: border,
            font: {
              color: foreground,
            },
          },
          margin: {
            b: 46,
            l: 54,
            r: 18,
            t: 12,
          },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          xaxis: {
            gridcolor: border,
            linecolor: border,
            tickcolor: border,
            title: {
              text: 'Time',
            },
            zerolinecolor: border,
          },
          yaxis: {
            gridcolor: border,
            linecolor: border,
            rangemode: 'tozero',
            tickcolor: border,
            title: {
              text: 'Cumulative workouts',
            },
            zerolinecolor: border,
          },
        },
        {
          displayModeBar: false,
          responsive: true,
        },
      )

      handleResize = () => {
        void Plotly.Plots.resize(chartElement)
      }

      window.addEventListener('resize', handleResize)
    })

    return () => {
      isCancelled = true
      if (handleResize) {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [workouts])

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-tertiary">
            Cumulative workouts
          </p>
          <p className="text-sm text-muted">
            Filtered workout count over time.
          </p>
        </div>
        {workouts.length > 0 ? (
          <div className="mt-4 h-72 w-full" ref={chartRef} />
        ) : (
          <div className="mt-4 flex h-40 items-center justify-center rounded-md border border-border bg-alabaster-grey p-6">
            <p className="text-sm text-muted">No workouts to graph with the current filters.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
