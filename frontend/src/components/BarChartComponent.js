import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BarChartComponent = ({ data, onBarClick }) => {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data}
        margin={{ top: 40, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend
          verticalAlign="bottom"
          align="center"
          content={({ payload }) => (
            <ul style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 10 }}>
              {payload.map((entry, index) => (
                <li key={`item-${index}`} style={{ display: "flex", alignItems: "center", fontSize: 13 }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 14,
                      height: 14,
                      backgroundColor: entry.color,
                      borderRadius: "50%",
                      marginRight: 6
                    }}
                  />
                  {entry.value}
                </li>
              ))}
            </ul>
          )}
        />

        {/* ✅ Tiket Selesai */}
        <Bar
          dataKey="ticketsCompleted"
          fill="#82ca9d"
          name="Tiket Selesai"
          cursor="pointer"
          onClick={(entry) =>
            onBarClick({ ...entry, status: 'Selesai' }) // hanya selesai
          }
        />

        {/* ✅ Sedang Dikerjakan (Sedang Dikerjakan + Ditunda) */}
        <Bar
          dataKey="ticketsInProgress"
          fill="#FFBB28"
          name="Sedang Dikerjakan"
          cursor="pointer"
          onClick={(entry) =>
            onBarClick({ ...entry, status: ['Sedang Dikerjakan', 'Ditunda'] })
          }
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default React.memo(BarChartComponent);
