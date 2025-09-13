import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const PieChartComponent = ({ stats, handleHomeClick, handleStatusFilterClick, statusFilter }) => {
  if (!stats) return null;

  const data = [
    { name: 'Belum Dikerjakan', value: stats.belum_dikerjakan },
    { name: 'Ditunda', value: stats.ditunda },
    { name: 'Sedang Dikerjakan', value: stats.sedang_dikerjakan },
    { name: 'Selesai', value: stats.selesai },
    { name: 'Ditolak', value: stats.ditolak },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const dataWithPercent = data.map((item) => ({
    ...item,
    percent: total > 0 ? ((item.value / total) * 100).toFixed(1) : 0
  }));

  const COLORS = ['#8884d8', '#95a5a6', '#FFBB28', '#82ca9d', '#ff2828'];

  const onPieClick = (entry) => {
    if (!entry || !entry.name) return;
    handleHomeClick();
    handleStatusFilterClick(entry.name);
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={dataWithPercent}
          cx="50%"
          cy="50%"
          innerRadius={50}   // ⬅️ lebih kecil
          outerRadius={80}   // ⬅️ lebih kecil
          fill="#8884d8"
          paddingAngle={2}
          dataKey="value"
          onClick={(entry) => onPieClick(entry.payload)}
          label={({ percent }) => `${percent}%`} // ⬅️ hanya persentase
        >
          {dataWithPercent.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              cursor="pointer"
              stroke={statusFilter === entry.name ? '#000' : 'none'}
              strokeWidth={statusFilter === entry.name ? 3 : 0}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name, props) => {
            const percent = props.payload.percent;
            return [`${value} tiket (${percent}%)`, name];
          }}
        />
        <Legend verticalAlign="bottom" height={50} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default React.memo(PieChartComponent);
