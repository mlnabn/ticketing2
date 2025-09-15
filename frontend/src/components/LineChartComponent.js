import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import dayjs from "dayjs";

const LineChartComponent = ({ data, onPointClick }) => {
  if (!data || data.length === 0) return null;

  // Ubah semua date ke timestamp (biar bisa pakai scale time)
  const formattedData = data.map((d) => ({
    ...d,
    date: new Date(d.date).getTime() // jadikan timestamp
  }));

  // Hitung nilai maksimum Y
  const maxValue = Math.max(
    ...formattedData.map((d) =>
      Math.max(d.belum || 0, d.sedang || 0, d.selesai || 0, d.ditolak || 0)
    )
  );

  // Handler klik titik chart
  const handlePointClick = (dataPoint, status) => {
    if (onPointClick) {
      onPointClick(status, dayjs(dataPoint.date).format("YYYY-MM-DD"));
    }
  };

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart
        data={formattedData}
        margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" />

        {/* Sumbu X pakai scale waktu */}
        <XAxis
          dataKey="date"
          type="number"
          scale="time"
          domain={["auto", "auto"]}
          tickFormatter={(date) => dayjs(date).format("DD/MM")}
          tick={{ fontSize: 11 }}
          tickMargin={10}
        />

        {/* Sumbu Y hanya genap */}
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11 }}
          domain={[0, maxValue + 2]}
          ticks={Array.from(
            { length: Math.ceil((maxValue + 2) / 2) + 1 },
            (_, i) => i * 2
          )}
        />

        <Tooltip
          labelFormatter={(label) => dayjs(label).format("DD MMM YYYY")}
        />
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
                      width: 14, // ukuran ikon
                      height: 14,
                      backgroundColor: entry.color,
                      borderRadius: "50%", // biar bulat
                      marginRight: 6
                    }}
                  />
                  {entry.value} {/* label legend */}
                </li>
              ))}
            </ul>
          )}
        />

        <Line
          type="monotone"
          dataKey="belum"
          stroke="#8884d8"
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
  );
};

export default React.memo(LineChartComponent);
