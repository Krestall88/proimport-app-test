'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ChartData {
  status: string;
  count: number;
}

interface OrderStatusChartProps {
  data: ChartData[];
}

// A more appealing color palette
const COLORS = {
  pending: '#fbbf24', // amber-400
  processing: '#60a5fa', // blue-400
  shipped: '#34d399', // emerald-400
  delivered: '#a78bfa', // violet-400
  cancelled: '#f87171', // red-400
};

// Russian translations for statuses
const statusTranslations: { [key: string]: string } = {
  pending: 'В ожидании',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменен',
};

export default function OrderStatusChart({ data }: OrderStatusChartProps) {
  const chartData = data.map(item => ({
    ...item,
    status: statusTranslations[item.status] || item.status,
    fill: COLORS[item.status as keyof typeof COLORS] || '#8884d8',
  }));

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Обзор заказов по статусам</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
            <XAxis dataKey="status" stroke="#d1d5db" fontSize={12} />
            <YAxis allowDecimals={false} stroke="#d1d5db" fontSize={12} />
            <Tooltip
              cursor={{ fill: 'rgba(107, 114, 128, 0.2)' }}
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
              labelStyle={{ color: '#f9fafb' }}
            />
            <Bar dataKey="count" name="Кол-во заказов" fill="#8884d8" background={{ fill: '#374151' }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
