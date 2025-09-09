import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BarChartComponent = ({ data, onBarClick }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 50, right: 30, left: 20, bottom: 1 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar 
          dataKey="ticketsCompleted" 
          fill="#8ebfe8c1" 
          name="Tiket Selesai" 
          cursor="pointer"
          onClick={(entry) => onBarClick(entry)} // <-- panggil handler
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default React.memo(BarChartComponent);;
