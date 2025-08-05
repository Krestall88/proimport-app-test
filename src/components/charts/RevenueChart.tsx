'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueData {
  date: string;
  revenue: number;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(amount);

export default function RevenueChart({ data }: { data: RevenueData[] }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-[350px]">
      <h3 className="text-xl font-semibold mb-4">Динамика выручки (30 дней)</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 50, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
          <XAxis dataKey="date" stroke="#A0AEC0" />
          <YAxis stroke="#A0AEC0" tickFormatter={(value) => `${(value as number) / 1000}k`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#2D3748', border: 'none' }}
            labelStyle={{ color: '#E2E8F0' }}
            formatter={(value) => [formatCurrency(value as number), 'Выручка']}
          />
          <Legend wrapperStyle={{ color: '#A0AEC0' }}/>
          <Line type="monotone" dataKey="revenue" stroke="#48BB78" strokeWidth={2} name="Выручка" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
