import { useEffect, useRef } from 'react'

export type ProgressSeries = {
  color?: string
  name: string
  x: string[]
  y: Array<number | null>
}

export function ProgressLineChart({
  emptyText = 'No data to chart yet.',
  series,
  yAxisTitle,
}: {
  emptyText?: string
  series: ProgressSeries[]
  yAxisTitle: string
}) {
  const chartRef = useRef<HTMLDivElement | null>(null)
  const hasData = series.some((item) => item.y.some((value) => value !== null))

  useEffect(() => {
    if (!chartRef.current || !hasData) {
      return undefined
    }

    const chartElement = chartRef.current
    let isCancelled = false
    let handleResize: (() => void) | null = null

    void import('plotly.js-dist-min').then(({ default: Plotly }) => {
      if (isCancelled) {
        return
      }

      const styles = getComputedStyle(document.documentElement)
      const foreground = styles.getPropertyValue('--color-foreground').trim()
      const border = styles.getPropertyValue('--color-border').trim()
      const surface = styles.getPropertyValue('--color-surface').trim()
      const primary = styles.getPropertyValue('--color-primary').trim()

      void Plotly.react(
        chartElement,
        series.map((item, index) => ({
          hovertemplate: `${item.name}: %{y}<br>%{x}<extra></extra>`,
          line: { color: item.color ?? (index === 0 ? primary : undefined), width: 3 },
          marker: { size: 7 },
          mode: 'lines+markers',
          name: item.name,
          type: 'scatter',
          x: item.x,
          y: item.y,
        })),
        {
          autosize: true,
          font: { color: foreground, family: 'inherit' },
          hoverlabel: { bgcolor: surface, bordercolor: border, font: { color: foreground } },
          margin: { b: 44, l: 54, r: 18, t: 12 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          xaxis: { gridcolor: border, linecolor: border, tickcolor: border, title: { text: 'Time' } },
          yaxis: { gridcolor: border, linecolor: border, tickcolor: border, title: { text: yAxisTitle } },
        },
        { displayModeBar: false, responsive: true },
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
  }, [hasData, series, yAxisTitle])

  if (!hasData) {
    return (
      <div className="flex h-72 items-center justify-center rounded-md border border-border bg-alabaster-grey p-6">
        <p className="text-sm text-muted">{emptyText}</p>
      </div>
    )
  }

  return <div className="h-72 w-full" ref={chartRef} />
}
