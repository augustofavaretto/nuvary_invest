"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { BentoTile } from "../BentoTile";

// Allocation tile — donut chart com alocacao por classe.
// Cores oficiais brandbook (cyan-500, navy-500, cyan-300, neutral).
interface AllocationDatum {
  name: string;
  value: number;
  color: string;
}

const mockAllocation: AllocationDatum[] = [
  { name: "Renda Fixa",   value: 50, color: "#00B8D9" },
  { name: "Acoes Brasil", value: 30, color: "#0B1F33" },
  { name: "ETFs",         value: 15, color: "#4FD2E3" },
  { name: "Caixa",        value: 5,  color: "#6B7280" },
];

interface AllocationTileProps {
  span?: string;
  data?: AllocationDatum[];
}

export function AllocationTile({
  span = "lg:col-span-4",
  data = mockAllocation,
}: AllocationTileProps) {
  return (
    <BentoTile span={span}>
      <header className="mb-3">
        <p className="text-xs uppercase tracking-wider text-text-secondary font-medium">
          Alocacao
        </p>
      </header>

      <div className="flex-1 flex items-center gap-4 min-h-0">
        <div className="w-28 h-28 shrink-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={36}
                outerRadius={54}
                stroke="none"
                isAnimationActive={false}
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-text-tertiary uppercase tracking-wider">
              Classes
            </span>
            <span className="text-lg font-semibold text-text-primary">
              {data.length}
            </span>
          </div>
        </div>

        <ul className="flex-1 space-y-1.5 text-xs min-w-0">
          {data.map((d) => (
            <li key={d.name} className="flex items-center justify-between gap-2 min-w-0">
              <span className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: d.color }}
                />
                <span className="text-text-primary truncate">{d.name}</span>
              </span>
              <span
                data-mono
                className="font-mono text-text-secondary shrink-0"
              >
                {d.value}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </BentoTile>
  );
}
