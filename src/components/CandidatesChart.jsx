import React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart'

// Dados de exemplo para candidatos por mês
const candidatesData = [
  { month: 'Jan', candidatos: 45, aprovados: 12 },
  { month: 'Fev', candidatos: 52, aprovados: 18 },
  { month: 'Mar', candidatos: 38, aprovados: 15 },
  { month: 'Abr', candidatos: 67, aprovados: 22 },
  { month: 'Mai', candidatos: 73, aprovados: 28 },
  { month: 'Jun', candidatos: 89, aprovados: 35 },
  { month: 'Jul', candidatos: 95, aprovados: 42 },
  { month: 'Ago', candidatos: 78, aprovados: 31 },
  { month: 'Set', candidatos: 84, aprovados: 38 },
  { month: 'Out', candidatos: 91, aprovados: 45 },
  { month: 'Nov', candidatos: 76, aprovados: 29 },
  { month: 'Dez', candidatos: 88, aprovados: 41 },
]

const chartConfig = {
  candidatos: {
    label: "Total de Candidatos",
    color: "hsl(var(--primary))",
  },
  aprovados: {
    label: "Candidatos Aprovados",
    color: "hsl(var(--chart-2))",
  },
}

export function CandidatesChart() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Evolução de Candidatos</CardTitle>
        <CardDescription>
          Total de candidatos e aprovados nos últimos 12 meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart
            data={candidatesData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
            />
            <Area
              type="monotone"
              dataKey="candidatos"
              stackId="1"
              stroke="var(--color-candidatos)"
              fill="var(--color-candidatos)"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="aprovados"
              stackId="2"
              stroke="var(--color-aprovados)"
              fill="var(--color-aprovados)"
              fillOpacity={0.8}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
