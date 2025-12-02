import React, { useState, useEffect, useMemo } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Line
} from 'recharts';

const CustomTooltip = ({ active, payload, label, isDarkMode }) => {
    if (active && payload && payload.length) {
        const style = {
            backgroundColor: isDarkMode ? "#2c2c2c" : "#fff",
            border: `1px solid ${isDarkMode ? "#555" : "#ccc"}`,
            padding: '10px',
            borderRadius: '5px',
            color: isDarkMode ? "#fff" : "#333",
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        };

        return (
            <div className="custom-tooltip" style={style}>
                <p className="label">{`${label}`}</p>
                {payload.map((pld, index) => (
                    <div key={index} style={{ color: pld.color }}>
                        {`${pld.name}: ${pld.value} unit`}
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const InventoryLineChartRecharts = ({ chartData }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [hiddenDatasets, setHiddenDatasets] = useState({});

    useEffect(() => {
        const updateModeFromStorage = () => {
            const savedMode = localStorage.getItem("darkMode");
            setIsDarkMode(savedMode === 'true');
        };
        updateModeFromStorage();
        window.addEventListener("storage", updateModeFromStorage);
        return () => window.removeEventListener("storage", updateModeFromStorage);
    }, []);


    const transformedData = useMemo(() => {
        if (!chartData || !chartData.labels || !chartData.datasets) {
            return [];
        }
        return chartData.labels.map((label, index) => {
            const dataPoint = { name: label };
            chartData.datasets.forEach(dataset => {
                dataPoint[dataset.label] = dataset.data[index];
            });
            return dataPoint;
        });
    }, [chartData]);


    const handleLegendClick = (dataKey) => {
        setHiddenDatasets(prev => ({ ...prev, [dataKey]: !prev[dataKey] }));
    };


    if (!chartData || !chartData.labels || !chartData.datasets) {
        return <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Memuat data chart...</div>;
    }

    const tickColor = isDarkMode ? "#a0a0a0" : "#666";
    const gridColor = isDarkMode ? "#444" : "#ddd";

    const legendColorMap = {
        'Barang Masuk': 'dot-green',
        'Barang Keluar': 'dot-red',
    };

    return (
        <div className="linechart-wrapper">
            <div style={{ position: 'relative', height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={transformedData}
                        margin={{ top: 5, right: 20, left: -10, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="name" tick={{ fill: tickColor }} stroke={gridColor} />
                        <YAxis tick={{ fill: tickColor }} stroke={gridColor} domain={[0, 'auto']} />
                        <Tooltip
                            content={<CustomTooltip isDarkMode={isDarkMode} />}
                            cursor={{ stroke: isDarkMode ? '#555' : '#ccc', strokeWidth: 1 }}
                        />
                        {chartData.datasets.map((dataset) => {
                            if (!hiddenDatasets[dataset.label]) {
                                return (
                                    <Line
                                        key={dataset.label}
                                        type="monotone" 
                                        dataKey={dataset.label}
                                        stroke={dataset.borderColor}
                                        strokeWidth={2}
                                        activeDot={{ r: 8 }}
                                        dot={{ r: 4 }}
                                        animationDuration={1500} 
                                    />
                                );
                            }
                            return null;
                        })}
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="chart-legend">
                {chartData.datasets.map((dataset) => (
                    <div
                        key={dataset.label}
                        className="legend-item2"
                        onClick={() => handleLegendClick(dataset.label)}
                        style={{
                            cursor: "pointer",
                            opacity: hiddenDatasets[dataset.label] ? 0.4 : 1,
                        }}
                    >
                        <span className={`legend-dot ${legendColorMap[dataset.label] || 'dot-blue'}`}></span>
                        <span className="legend-text">{dataset.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InventoryLineChartRecharts;