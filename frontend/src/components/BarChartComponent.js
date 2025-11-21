import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p style={{ fontWeight: 600, marginBottom: 6 }}>{label}</p>
        {payload.map((item, i) => (
          <p key={i} style={{ margin: 0 }}>
            <span style={{ color: item.fill, fontWeight: 'bold' }}>●</span>{' '}
            {item.name}: {item.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const formatTickName = (value, maxLength = 12) => {
  if (value && value.length > maxLength) {
    return value.substring(0, maxLength - 4) + '...';
  }
  return value;
};

const BarChartComponent = ({ data, onBarClick }) => {
  return (
    <div className="barchart-wrapper">
      <ResponsiveContainer width="100%" height={330}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 8, left: -20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            interval={0}
            tick={{ fontSize: 13 }}
            tickFormatter={(name) => formatTickName(name, 12)}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
          <Tooltip content={<CustomTooltip />} />

          {/* ✅ Tiket Selesai */}
          <Bar
            dataKey="ticketsCompleted"
            fill="#82ca9d"
            name="Tiket Selesai"
            cursor="pointer"
            onClick={(entry) =>
              onBarClick({ ...entry, status: "Selesai" })
            }
          />

          {/* ✅ Sedang Dikerjakan (Sedang Dikerjakan + Ditunda) */}
          <Bar
            dataKey="ticketsInProgress"
            fill="#FFBB28"
            name="Sedang Dikerjakan"
            cursor="pointer"
            onClick={(entry) =>
              onBarClick({
                ...entry,
                status: "Sedang Dikerjakan",
              })
            }
          />
        </BarChart>
      </ResponsiveContainer>

      {/* ✅ Custom Legend (konsisten dengan Line & Pie) */}
      {/* <div className="chart-legend" style={{ justifyContent: 'center', marginTop: '-10px' }}>
        <div
          className="legend-item2"
          onClick={() => onBarClick({ status: "Selesai" })}
          style={{ cursor: "pointer" }}
        >
          <span
            className="legend-dot"
            style={{ backgroundColor: "#82ca9d" }}
          ></span>
          <span className="legend-text">Tiket Selesai</span>
        </div>

        <div
          className="legend-item2"
          onClick={() => onBarClick({ status: "Sedang Dikerjakan" })}
          style={{ cursor: "pointer" }}
        >
          <span
            className="legend-dot"
            style={{ backgroundColor: "#FFBB28" }}
          ></span>
          <span className="legend-text">Sedang Dikerjakan</span>
        </div>
      </div> */}
    </div>
  );
};

export default React.memo(BarChartComponent);
