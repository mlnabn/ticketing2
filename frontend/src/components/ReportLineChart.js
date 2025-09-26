// file: src/components/ReportLineChart.js

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import dayjs from "dayjs";

const ReportLineChart = ({ data }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // (BARU) State untuk mengontrol garis mana yang terlihat
  const [visibleLines, setVisibleLines] = useState(["Total Tiket", "Tiket Dikerjakan"]);

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === 'true';
    setIsDarkMode(savedMode);
    
    const handleStorageChange = () => {
      setIsDarkMode(localStorage.getItem("darkMode") === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // (BARU) Fungsi untuk menangani klik pada legend
  const handleLegendClick = (lineName) => {
    // Jika semua garis terlihat, klik satu untuk menampilkan hanya satu itu
    if (visibleLines.length === 2) {
      setVisibleLines([lineName]);
    } 
    // Jika hanya satu garis yang terlihat dan diklik lagi, tampilkan semua
    else if (visibleLines.length === 1 && visibleLines[0] === lineName) {
      setVisibleLines(["Total Tiket", "Tiket Dikerjakan"]);
    } 
    // Jika hanya satu garis yang terlihat dan garis lain diklik, ganti
    else {
      setVisibleLines([lineName]);
    }
  };

  if (!data || data.length === 0) return <p>Tidak ada data untuk ditampilkan pada chart.</p>;

  const formattedData = data.map((d) => ({
    ...d,
    date: new Date(d.date).getTime()
  }));

  return (
    <div className="linechart-wrapper">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: -10, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#444" : "#ddd"} />
          <XAxis
            dataKey="date"
            type="number"
            scale="time"
            domain={["auto", "auto"]}
            tickFormatter={(date) => dayjs(date).format("DD")} // Tampilkan tanggal saja agar tidak penuh
            tick={{ fontSize: 11 }}
            tickMargin={10}
            axisLine={{ stroke: isDarkMode ? "#888" : "#ccc" }}
            tickLine={{ stroke: isDarkMode ? "#888" : "#ccc" }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11 }}
            domain={['dataMin', 'dataMax + 5']}
            axisLine={{ stroke: isDarkMode ? "#888" : "#ccc" }}
            tickLine={{ stroke: isDarkMode ? "#888" : "#ccc" }}
          />
          <Tooltip
            labelFormatter={(label) => dayjs(label).format("DD MMM YYYY")}
            contentStyle={{
              backgroundColor: isDarkMode ? "#2c2c2c" : "#fff",
              border: `1px solid ${isDarkMode ? "#555" : "#ccc"}`,
              color: isDarkMode ? "#fff" : "#333",
              fontSize: "12px"
            }}
          />

          {/* (DIUBAH) Render Line secara kondisional berdasarkan state visibleLines */}
          {visibleLines.includes("Total Tiket") && (
            <Line type="monotone" dataKey="total" stroke="#2196f3" name="Total Tiket" dot={false} />
          )}
          {visibleLines.includes("Tiket Dikerjakan") && (
            <Line type="monotone" dataKey="dikerjakan" stroke="#FFBB28" name="Tiket Dikerjakan" dot={false} />
          )}
        </LineChart>
      </ResponsiveContainer>
      
      {/* (DIUBAH) Legend custom dibuat interaktif */}
      <div className="chart-legend">
        <div
          className="legend-item2"
          onClick={() => handleLegendClick("Total Tiket")}
          style={{ cursor: 'pointer', opacity: visibleLines.includes("Total Tiket") ? 1 : 0.4 }}
        >
          <span className="legend-dot dot-blue"></span>
          <span className="legend-text">Total Tiket</span>
        </div>
        <div
          className="legend-item2"
          onClick={() => handleLegendClick("Tiket Dikerjakan")}
          style={{ cursor: 'pointer', opacity: visibleLines.includes("Tiket Dikerjakan") ? 1 : 0.4 }}
        >
          <span className="legend-dot dot-yellow"></span>
          <span className="legend-text">Tiket Dikerjakan</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ReportLineChart);