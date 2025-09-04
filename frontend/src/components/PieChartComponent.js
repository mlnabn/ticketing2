import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const PieChartComponent = ({ stats }) => {
  if (!stats) return null;

  const data = [
    { name: 'Belum Selesai', value: stats.pending_tickets },
    { name: 'Selesai', value: stats.completed_tickets },
    { name: 'Ditolak', value: stats.rejected_tickets },
  ];

  const COLORS = ['#FF8042', '#00C49F', '#FFBB28'];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartComponent;