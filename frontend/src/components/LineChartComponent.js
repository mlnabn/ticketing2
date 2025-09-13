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
          dataKey="belum"
          stroke="#8884d8"
          name="Belum Dikerjakan"
          activeDot={{
            onClick: (e, payload) => handlePointClick(payload.payload, 'Belum Dikerjakan'),
            cursor: 'pointer'
          }}
        />

        <Line
          type="monotone"
          dataKey="sedang"
          stroke="#FFBB28"
          name="Sedang Dikerjakan"
          activeDot={{
            onClick: (e, payload) => handlePointClick(payload.payload, 'Sedang Dikerjakan'),
            cursor: 'pointer'
          }}
        />

        <Line
          type="monotone"
          dataKey="selesai"
          stroke="#82ca9d"
          name="Selesai"
          activeDot={{
            onClick: (e, payload) => handlePointClick(payload.payload, 'Selesai'),
            cursor: 'pointer'
          }}
        />

        <Line
          type="monotone"
          dataKey="ditolak"
          stroke="#ff2828"
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
