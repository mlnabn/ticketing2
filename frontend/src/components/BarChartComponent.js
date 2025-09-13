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
        <Legend />

        {/* Tiket Selesai */}
        <Bar
          dataKey="ticketsCompleted"
          fill="#82ca9d"
          name="Tiket Selesai"
          cursor="pointer"
          onClick={(entry) => onBarClick({ ...entry, status: 'Selesai' })}
        />

        {/* Sedang Dikerjakan */}
        <Bar
          dataKey="ticketsInProgress"
          fill="#FFBB28"
          name="Sedang Dikerjakan"
          cursor="pointer"
          onClick={(entry) => onBarClick({ ...entry, status: 'Sedang Dikerjakan' })}
        />

        {/* Ditolak */}
        <Bar
          dataKey="ticketsRejected"
          fill="#ff2828"
          name="Ditolak"
          cursor="pointer"
          onClick={(entry) => onBarClick({ ...entry, status: 'Ditolak' })}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default React.memo(BarChartComponent);
