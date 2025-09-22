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

const LineChartComponent = ({ data, onPointClick, onLegendClick }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // ambil status darkmode dari localStorage
  useEffect(() => {
    const updateModeFromStorage = () => {
      const savedMode = localStorage.getItem("darkMode");
      if (savedMode !== null) {
        setIsDarkMode(JSON.parse(savedMode));
      }
    };

    updateModeFromStorage();
    window.addEventListener("storage", updateModeFromStorage);

    return () => {
      window.removeEventListener("storage", updateModeFromStorage);
    };
  }, []);

  if (!data || data.length === 0) return null;

  const formattedData = data.map((d) => ({
    ...d,
    date: new Date(d.date).getTime()
  }));

  const maxValue = Math.max(
    ...formattedData.map((d) =>
      Math.max(d.belum || 0, d.sedang || 0, d.selesai || 0, d.ditolak || 0)
    )
  );

  const handlePointClick = (dataPoint, status) => {
    if (onPointClick) {
      onPointClick(status, dayjs(dataPoint.date).format("YYYY-MM-DD"));
    }
  };

  return (
    <div className="linechart-wrapper">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: -10, bottom: 30 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDarkMode ? "#444" : "#ddd"}
          />

          <XAxis
            dataKey="date"
            type="number"
            scale="time"
            domain={["auto", "auto"]}
            tickFormatter={(date) => dayjs(date).format("DD/MM")}
            tick={{ fontSize: 11 }}
            tickMargin={10}
            axisLine={{ stroke: isDarkMode ? "#888" : "#ccc" }}
            tickLine={{ stroke: isDarkMode ? "#888" : "#ccc" }}
          />

          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11 }}
            domain={[0, maxValue + 2]}
            ticks={Array.from(
              { length: Math.ceil((maxValue + 2) / 2) + 1 },
              (_, i) => i * 2
            )}
            axisLine={{ stroke: isDarkMode ? "#888" : "#ccc" }}
            tickLine={{ stroke: isDarkMode ? "#888" : "#ccc" }}
          />

          <Tooltip
            labelFormatter={(label) => dayjs(label).format("DD MMM YYYY")}
            contentStyle={{
              backgroundColor: isDarkMode ? "#2c2c2c" : "#fff",
              border: "1px solid",
              borderColor: isDarkMode ? "#555" : "#ccc",
              color: isDarkMode ? "#fff" : "#333",
              fontSize: "12px"
            }}
          />

          <Line
            type="monotone"
            dataKey="belum"
            stroke="#2196f3"
            name="Belum Dikerjakan"
            activeDot={{
              onClick: (e, payload) =>
                handlePointClick(payload.payload, "Belum Dikerjakan"),
              cursor: "pointer"
            }}
          />
          <Line
            type="monotone"
            dataKey="sedang"
            stroke="#FFBB28"
            name="Sedang Dikerjakan"
            activeDot={{
              onClick: (e, payload) =>
                handlePointClick(payload.payload, "Sedang Dikerjakan"),
              cursor: "pointer"
            }}
          />
          <Line
            type="monotone"
            dataKey="selesai"
            stroke="#82ca9d"
            name="Selesai"
            activeDot={{
              onClick: (e, payload) =>
                handlePointClick(payload.payload, "Selesai"),
              cursor: "pointer"
            }}
          />
          <Line
            type="monotone"
            dataKey="ditolak"
            stroke="#ff2828"
            name="Ditolak"
            activeDot={{
              onClick: (e, payload) =>
                handlePointClick(payload.payload, "Ditolak"),
              cursor: "pointer"
            }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend di luar chart */}
      <div className="chart-legend">
        <div
          className="legend-item2"
          onClick={() => onLegendClick && onLegendClick("Belum Dikerjakan")}
          style={{ cursor: "pointer" }}
        >
          <span className="legend-dot dot-blue"></span>
          <span className="legend-text">Belum Dikerjakan</span>
        </div>
        <div
          className="legend-item2"
          onClick={() => onLegendClick && onLegendClick("Sedang Dikerjakan")}
          style={{ cursor: "pointer" }}
        >
          <span className="legend-dot dot-yellow"></span>
          <span className="legend-text">Sedang Dikerjakan</span>
        </div>
        <div
          className="legend-item2"
          onClick={() => onLegendClick && onLegendClick("Selesai")}
          style={{ cursor: "pointer" }}
        >
          <span className="legend-dot dot-green"></span>
          <span className="legend-text">Selesai</span>
        </div>
        <div
          className="legend-item2"
          onClick={() => onLegendClick && onLegendClick("Ditolak")}
          style={{ cursor: "pointer" }}
        >
          <span className="legend-dot dot-red"></span>
          <span className="legend-text">Ditolak</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LineChartComponent);
