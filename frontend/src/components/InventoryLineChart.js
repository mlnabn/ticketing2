import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Registrasi komponen-komponen Chart.js
ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
);

const InventoryLineChart = ({ chartData }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const chartRef = useRef(null); // Ref untuk mengakses instance chart

    // Efek untuk mendeteksi perubahan dark mode dari localStorage
    useEffect(() => {
        const updateModeFromStorage = () => {
            const savedMode = localStorage.getItem("darkMode");
            setIsDarkMode(savedMode === 'true');
        };
        updateModeFromStorage();
        window.addEventListener("storage", updateModeFromStorage);
        return () => window.removeEventListener("storage", updateModeFromStorage);
    }, []);

    // Konfigurasi dinamis berdasarkan dark mode
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false, // Sembunyikan legend bawaan karena kita buat yang custom
            },
            title: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: isDarkMode ? "#2c2c2c" : "#fff",
                titleColor: isDarkMode ? "#fff" : "#333",
                bodyColor: isDarkMode ? "#fff" : "#333",
                borderColor: isDarkMode ? "#555" : "#ccc",
                borderWidth: 1,
                callbacks: {
                    label: (context) => `${context.dataset.label || ''}: ${context.parsed.y} unit`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                    color: isDarkMode ? "#a0a0a0" : "#666",
                },
                grid: {
                    color: isDarkMode ? "#444" : "#ddd",
                    borderDash: [3, 3],
                },
            },
            x: {
                ticks: {
                    color: isDarkMode ? "#a0a0a0" : "#666",
                },
                grid: {
                    display: false,
                },
            },
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
        elements: {
            line: {
                tension: 0.4,
            },
        },
    };

    // Fungsi untuk handle klik pada legend kustom
    const handleLegendClick = (datasetIndex) => {
        const chart = chartRef.current;
        if (chart) {
            const isVisible = chart.isDatasetVisible(datasetIndex);
            chart.setDatasetVisibility(datasetIndex, !isVisible);
            chart.update();
        }
    };

    if (!chartData || !chartData.labels || !chartData.datasets) {
        return <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Memuat data chart...</div>;
    }

    // Menentukan warna dot untuk legend
    const legendColorMap = {
        'Barang Masuk': 'dot-green',
        'Barang Keluar': 'dot-red',
    };

    return (
        // Menggunakan className yang sama dengan LineChartComponent
        <div className="linechart-wrapper">
            <div style={{ position: 'relative', height: '350px' }}>
                <Line ref={chartRef} options={options} data={chartData} />
            </div>

            {/* Legend custom yang meniru style dari LineChartComponent */}
            <div className="chart-legend">
                {chartData.datasets.map((dataset, index) => {
                    const chart = chartRef.current;
                    const isVisible = chart ? chart.isDatasetVisible(index) : true;

                    return (
                        <div
                            key={dataset.label}
                            className="legend-item2"
                            onClick={() => handleLegendClick(index)}
                            style={{
                                cursor: "pointer",
                                opacity: isVisible ? 1 : 0.4,
                            }}
                        >
                            <span className={`legend-dot ${legendColorMap[dataset.label] || 'dot-blue'}`}></span>
                            <span className="legend-text">{dataset.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default InventoryLineChart;

