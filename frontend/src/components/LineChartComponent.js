import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LineChartComponent = ({ data }) => {
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
        <Line type="monotone" dataKey="created" stroke="#8884d8" name="Dibuat" />
        <Line type="monotone" dataKey="completed" stroke="#82ca9d" name="Selesai" />
        <Line type="monotone" dataKey="rejected" stroke="#ffc658" name="Ditolak" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;