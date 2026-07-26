import { Cell, Legend, Pie, PieChart as RePieChart, ResponsiveContainer, Tooltip } from 'recharts'
import ChartTooltip from '../ChartTooltip'

const COLORS = ['#3d52c4', '#10b981', '#f59e0b', '#8b5cf6', '#94a3b8']

export default function PieChart({ data, dataKey, nameKey, valueFormatter, height = 240 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RePieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          innerRadius="62%"
          outerRadius="90%"
          paddingAngle={3}
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={entry[nameKey]} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip formatter={valueFormatter} />} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12 }}
          formatter={(value) => <span className="text-slate-600 dark:text-slate-300">{value}</span>}
        />
      </RePieChart>
    </ResponsiveContainer>
  )
}
