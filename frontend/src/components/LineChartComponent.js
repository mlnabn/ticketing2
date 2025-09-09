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
    <ResponsiveContainer width="100%" height={280}>
      <LineChart
        data={data}
        margin={{ top: 15, right: 30, left: -10, bottom: 15 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis />
        <Tooltip />
        <Legend />

        <Line
          type="monotone"
          dataKey="created"
          stroke="#8ebfe8c1"
          name="Dibuat"
          activeDot={{
            onClick: (e, payload) => handlePointClick(payload.payload, 'Dibuat'),
            cursor: 'pointer'
          }}
        />
        <Line
          type="monotone"
          dataKey="completed"
          stroke="#45e0b4f7"
          name="Selesai"
          activeDot={{
            onClick: (e, payload) => handlePointClick(payload.payload, 'Selesai'),
            cursor: 'pointer'
          }}
        />
        <Line
          type="monotone"
          dataKey="rejected"
          stroke="#f5dd06ae"
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

export default React.memo(LineChartComponent);;
