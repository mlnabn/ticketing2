import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <p style={{ fontWeight: 600, marginBottom: 6 }}>
          {item.name}
        </p>
        <p style={{ margin: 0 }}>
          {item.value} tiket ({item.percent}%)
        </p>
      </div>
    );
  }
  return null;
};

const PieChartComponent = ({ stats, handleStatusFilterClick, statusFilter }) => {
  if (!stats) return null;

  const data = [
    { name: 'Ditunda', value: stats.ditunda || 0, color: '#95a5a6', dotClass: 'dot-gray' },
    { name: 'Selesai', value: stats.selesai || 0, color: '#82ca9d', dotClass: 'dot-green' },
    { name: 'Ditolak', value: stats.ditolak || 0, color: '#ff2828', dotClass: 'dot-red' },
    { name: 'Belum Dikerjakan', value: stats.belum_dikerjakan || 0, color: '#3498db', dotClass: 'dot-blue' },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const dataWithPercent = data.map((item) => ({
    ...item,
    percent: total > 0 ? ((item.value / total) * 100).toFixed(1) : 0,
  }));

  const onPieClick = (entry) => {
    if (!entry || !entry.name) return;
    handleStatusFilterClick(entry.name);
  };

  return (
    <div style={{ width: "100%", height: 300, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Chart */}
      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={dataWithPercent}
              cx="50%"
              cy="45%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={0}
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
                  fill={entry.color}
                  cursor="pointer"
                  stroke={statusFilter === entry.name ? '#000' : 'none'}
                  strokeWidth={statusFilter === entry.name ? 3 : 0}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-legend"style={{ justifyContent: 'center', marginTop: '-10px' }}>
        {dataWithPercent.map((entry, index) => (
          <div
            key={index}
            className="legend-item2"
            onClick={() => {
              handleStatusFilterClick(entry.name);
            }}
            style={{ cursor: "pointer" }}
          >
            <span className={`legend-dot ${entry.dotClass}`}></span>
            <span className="legend-text">
              {entry.name} ({entry.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(PieChartComponent);
