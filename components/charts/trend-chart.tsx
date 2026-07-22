'use client'

import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '@/components/ui/card'

interface TrendPoint {
  label: string
  value: number
}

const AXIS = 'oklch(0.68 0.008 264)'
const GRID = 'oklch(1 0 0 / 8%)'

function ChartTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold tabular-nums">
        {payload[0].value}
        {unit ? ` ${unit}` : ''}
      </p>
    </div>
  )
}

export function TrendChart({
  title,
  data,
  color = 'var(--chart-1)',
  unit,
  area = true,
  note,
}: {
  title: string
  data: TrendPoint[]
  color?: string
  unit?: string
  area?: boolean
  note?: string
}) {
  const latest = data[data.length - 1]?.value
  const first = data[0]?.value
  const delta = latest != null && first != null ? latest - first : 0
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pad = span * 0.4
  const domain: [number, number] = [
    Math.floor(min - pad),
    Math.ceil(max + pad),
  ]

  return (
    <Card className="gap-2 p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="text-right">
          <span className="text-lg font-semibold tabular-nums">
            {latest}
            {unit ? <span className="ml-0.5 text-xs text-muted-foreground">{unit}</span> : null}
          </span>
          {delta !== 0 && (
            <span
              className={`ml-2 text-xs tabular-nums ${delta > 0 ? 'text-success' : 'text-destructive'}`}
            >
              {delta > 0 ? '+' : ''}
              {delta.toFixed(delta % 1 === 0 ? 0 : 1)}
            </span>
          )}
        </div>
      </div>
      <div className="h-32 w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            {area ? (
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`g-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey="label" stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} width={28} domain={domain} allowDecimals={false} />
              <Tooltip content={<ChartTooltip unit={unit} />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#g-${title})`}
                animationDuration={700}
              />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey="label" stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} width={28} domain={domain} allowDecimals={false} />
              <Tooltip content={<ChartTooltip unit={unit} />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={{ r: 2.5, fill: color }}
                animationDuration={700}
              />
            </LineChart>
          )}
          </ResponsiveContainer>
        ) : null}
      </div>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
    </Card>
  )
}
