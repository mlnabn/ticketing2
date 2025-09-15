import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const PieChartComponent = ({ stats, handleHomeClick, handleStatusFilterClick, statusFilter }) => {
  if (!stats) return null;

  const data = [
    { name: 'Ditunda', value: stats.ditunda },
    { name: 'Selesai', value: stats.selesai },
    { name: 'Ditolak', value: stats.ditolak },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const dataWithPercent = data.map((item) => ({
    ...item,
    percent: total > 0 ? ((item.value / total) * 100).toFixed(1) : 0,
  }));

  const COLORS = ['#95a5a6', '#82ca9d', '#ff2828'];

  const onPieClick = (entry) => {
    if (!entry || !entry.name) return;
    handleHomeClick();
    handleStatusFilterClick(entry.name);
  };

  return (
    <div style={{ width: "100%", height: 320, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Chart */}
      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={dataWithPercent}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              onClick={(entry) => onPieClick(entry.payload)}
              label={({ percent, x, y, fill }) => (
                <text
                  x={x}
                  y={y}
                  fill={fill}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={13}
                >
                  {percent > 0 ? `${percent}%` : ""}
                </text>
              )}
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
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend (dipisah biar ga ngedorong chart) */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 20,
          marginTop: -10, // atur supaya lebih dekat ke chart
        }}
      >
        {dataWithPercent.map((entry, index) => (
          <div
            key={index}
            style={{ display: "flex", alignItems: "center", fontSize: 13 }}
          >
            <span
              style={{
                display: "inline-block",
                width: 14,
                height: 14,
                backgroundColor: COLORS[index],
                borderRadius: "50%",
                marginRight: 6,
              }}
            />
            {entry.name} ({entry.value})
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(PieChartComponent);
