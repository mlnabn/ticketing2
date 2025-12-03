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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p style={{ fontWeight: 600, marginBottom: 6 }}>
          {dayjs(label).format("DD MMM YYYY")}
        </p>
        {payload.map((item, i) => (
          <p key={i} style={{ margin: 0 }}>
            <span style={{ color: item.stroke, fontWeight: "bold" }}>●</span>{" "}
            {item.name}: {item.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const LineChartComponent = ({ data, onPointClick }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [visibleStatuses, setVisibleStatuses] = useState([
    "Belum Dikerjakan",
    "Sedang Dikerjakan",
    "Selesai",
    "Ditolak",
  ]);

  useEffect(() => {
    const updateModeFromStorage = () => {
      const savedMode = localStorage.getItem("darkMode");
      if (savedMode !== null) {
        setIsDarkMode(JSON.parse(savedMode));
      }
    };
    updateModeFromStorage();
    window.addEventListener("storage", updateModeFromStorage);
    return () => window.removeEventListener("storage", updateModeFromStorage);
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
  const handleLegendClick = (status) => {
    if (visibleStatuses.length === 4) {
      setVisibleStatuses([status]);
    } else if (visibleStatuses.length === 1 && visibleStatuses[0] === status) {
      setVisibleStatuses([
        "Belum Dikerjakan",
        "Sedang Dikerjakan",
        "Selesai",
        "Ditolak",
      ]);
    } else {
      setVisibleStatuses([status]);
    }
  };

  return (
    <div className="linechart-wrapper">
      <ResponsiveContainer width="100%" height={210}>
        <LineChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: -30, bottom: 0 }}
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

          <Tooltip content={<CustomTooltip />} />

          {visibleStatuses.includes("Belum Dikerjakan") && (
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
          )}
          {visibleStatuses.includes("Sedang Dikerjakan") && (
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
          )}
          {visibleStatuses.includes("Selesai") && (
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
          )}
          {visibleStatuses.includes("Ditolak") && (
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
          )}
        </LineChart>
      </ResponsiveContainer>
      <div className="chart-legend" style={{ justifyContent: 'center', marginTop: '10px' }}>
        {[
          { status: "Belum Dikerjakan", color: "dot-blue" },
          { status: "Selesai", color: "dot-green" },
          { status: "Sedang Dikerjakan", color: "dot-yellow" },    
          { status: "Ditolak", color: "dot-red" },
        ].map((item) => (
          <div
            key={item.status}
            className="legend-item2"
            onClick={() => handleLegendClick(item.status)}
            style={{
              cursor: "pointer",
              opacity: visibleStatuses.includes(item.status) ? 1 : 0.4,
            }}
          >
            <span className={`legend-dot ${item.color}`}></span>
            <span className="legend-text">{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(LineChartComponent);
