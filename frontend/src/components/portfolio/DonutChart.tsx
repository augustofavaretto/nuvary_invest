'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency, formatPercentage } from '@/services/portfolioService';

interface DonutChartProps {
  data: {
    name: string;
    value: number;
    percentage: number;
    color: string;
  }[];
  centerValue?: string;
  centerLabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function DonutChart({ data, centerValue, centerLabel, size = 'md' }: DonutChartProps) {
  const dimensions = {
    sm: { width: 160, height: 160, innerRadius: 50, outerRadius: 70 },
    md: { width: 200, height: 200, innerRadius: 65, outerRadius: 90 },
    lg: { width: 240, height: 240, innerRadius: 80, outerRadius: 110 },
  };

  const { width, height, innerRadius, outerRadius } = dimensions[size];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; percentage: number } }> }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white shadow-lg rounded-lg p-3 border border-[#E5E7EB]">
          <p className="font-semibold text-[#0B1F33]">{item.name}</p>
          <p className="text-sm text-[#6B7280]">{formatCurrency(item.value)}</p>
          <p className="text-sm text-[#00B8D9]">{formatPercentage(item.percentage)} da carteira</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative" style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Center content */}
      {(centerValue || centerLabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && (
            <span className="text-lg font-bold text-[#0B1F33]">{centerValue}</span>
          )}
          {centerLabel && (
            <span className="text-xs text-[#6B7280]">{centerLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
