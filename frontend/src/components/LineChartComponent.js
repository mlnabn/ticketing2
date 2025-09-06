import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const LineChartComponent = ({ data, onPointClick }) => {
  if (!data || data.length === 0) return null;

  // Custom click handler untuk titik
  const handlePointClick = (dataPoint, status) => {
    if (onPointClick) {
      onPointClick(status, dataPoint.date); // kirim status + tanggal ke parent
    }
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />

        <Line
          type="monotone"
          dataKey="created"
          stroke="#8884d8"
          name="Dibuat"
          activeDot={{
            onClick: (e, payload) => handlePointClick(payload.payload, 'Dibuat'),
            cursor: 'pointer'
          }}
        />
        <Line
          type="monotone"
          dataKey="completed"
          stroke="#82ca9d"
          name="Selesai"
          activeDot={{
            onClick: (e, payload) => handlePointClick(payload.payload, 'Selesai'),
            cursor: 'pointer'
          }}
        />
        <Line
          type="monotone"
          dataKey="rejected"
          stroke="#ffc658"
          name="Ditolak"
          activeDot={{
            onClick: (e, payload) => handlePointClick(payload.payload, 'Ditolak'),
            cursor: 'pointer'
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;
