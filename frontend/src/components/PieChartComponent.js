import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const PieChartComponent = ({ stats, handleHomeClick, handleStatusFilterClick, statusFilter }) => {
  if (!stats) return null;

  const data = [
    { name: 'Belum Selesai', value: stats.pending_tickets },
    { name: 'Selesai', value: stats.completed_tickets },
  ];

  const COLORS = ['#FF8042', '#00C49F', '#FFBB28'];

  // Klik slice pie chart
  const onPieClick = (entry) => {
    if (!entry || !entry.name) return;

    handleHomeClick();                // pindah ke halaman Tiket
    handleStatusFilterClick(entry.name); // filter sesuai slice
  };

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
          onClick={(entry) => onPieClick(entry.payload)}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              cursor="pointer"
              stroke={statusFilter === entry.name ? '#000' : 'none'} // highlight jika aktif
              strokeWidth={statusFilter === entry.name ? 3 : 0}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartComponent;
