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

const BarChartComponent = ({ data, onBarClick }) => {
  return (
    <div className="barchart-wrapper">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 40, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />

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
                status: ["Sedang Dikerjakan", "Ditunda"],
              })
            }
          />
        </BarChart>
      </ResponsiveContainer>

      {/* ✅ Custom Legend (konsisten dengan Line & Pie) */}
      <div className="chart-legend">
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
          onClick={() => onBarClick({ status: ["Sedang Dikerjakan", "Ditunda"] })}
          style={{ cursor: "pointer" }}
        >
          <span
            className="legend-dot"
            style={{ backgroundColor: "#FFBB28" }}
          ></span>
          <span className="legend-text">Sedang Dikerjakan</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(BarChartComponent);
