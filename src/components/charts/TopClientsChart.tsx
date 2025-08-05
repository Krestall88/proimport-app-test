'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ClientData {
  name: string;
  total: number;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(amount);

export default function TopClientsChart({ data }: { data: ClientData[] }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-[350px]">
      <h3 className="text-xl font-semibold mb-4">Топ-5 клиентов</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
          <XAxis type="number" stroke="#A0AEC0" tickFormatter={(value) => `${(value as number) / 1000}k`} />
          <YAxis type="category" dataKey="name" stroke="#A0AEC0" width={120} interval={0} />
          <Tooltip
            contentStyle={{ backgroundColor: '#2D3748', border: 'none' }}
            labelStyle={{ color: '#E2E8F0' }}
            formatter={(value) => [formatCurrency(value as number), 'Сумма заказов']}
          />
          <Legend wrapperStyle={{ color: '#A0AEC0' }}/>
          <Bar dataKey="total" fill="#4299E1" name="Сумма заказов" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
