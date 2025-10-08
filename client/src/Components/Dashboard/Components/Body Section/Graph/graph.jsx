import React, { useEffect, useState, useCallback } from 'react';
import { Chart as ChartJS } from "chart.js/auto";
import { Line } from "react-chartjs-2";

const Graph = ({ node = 1 }) => {
    const [sensorData, setSensorData] = useState({});
    const [visibleData, setVisibleData] = useState({});
    const [sliderValues, setSliderValues] = useState({});
    const [liveMode, setLiveMode] = useState(true);
    const [timeRange, setTimeRange] = useState({ start: "", end: "" });

    const maxPoints = 20;

    const getNodeEndpoint = (node) => {
        if (node === 1) return '/api/sensorData/node1';
        if (node === 2) return '/api/sensorData/node2';
        if (node === 3) return '/api/sensorData/node3';
        return null;
    };

    const fetchData = useCallback(async () => {
        try {
            const endpoint = getNodeEndpoint(node);
            const res = await fetch(`http://localhost:3000${endpoint}`);
            const json = await res.json();
            setSensorData(json || {});
        } catch (err) {
            console.error("Fetch error:", err);
        }
    }, [node]);

    useEffect(() => {
        // Fetch data immediately when node changes, regardless of live mode
        fetchData();
        
        // Only set up interval if in live mode
        if (liveMode) {
            const interval = setInterval(fetchData, 5000);
            return () => clearInterval(interval);
        }
    }, [fetchData, liveMode, node]);

    useEffect(() => {
        const newVisibleData = {};
        const newSliderValues = {};
        Object.keys(sensorData).forEach(id => {
            const sorted = (sensorData[id] || []).slice().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            const start = Math.max(0, sorted.length - maxPoints);
            newVisibleData[id] = sorted.slice(start);
            newSliderValues[id] = start;
        });
        setVisibleData(newVisibleData);
        setSliderValues(newSliderValues);
    }, [sensorData]);

    const handleSliderChange = (sensorId, value) => {
        const data = (sensorData[sensorId] || []).slice().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const start = parseInt(value);
        const end = Math.min(start + maxPoints, data.length);
        setVisibleData(prev => ({
            ...prev,
            [sensorId]: data.slice(start, end)
        }));
        setSliderValues(prev => ({ ...prev, [sensorId]: start }));
    };

    const handleTimeSearch = () => {
        if (!timeRange.start || !timeRange.end) return;
        setLiveMode(false);

        const newVisibleData = {};
        Object.keys(sensorData).forEach(id => {
            const filtered = (sensorData[id] || []).filter(row => {
                const t = new Date(row.timestamp);
                return t >= new Date(timeRange.start) && t <= new Date(timeRange.end);
            });
            newVisibleData[id] = filtered;
        });
        setVisibleData(newVisibleData);
    };

    const toggleLive = () => {
        setLiveMode(prev => !prev);
    };

    const sensorIds = Object.keys(visibleData).sort((a, b) => {
        const numA = parseInt(a.replace('sensor_', ''), 10);
        const numB = parseInt(b.replace('sensor_', ''), 10);
        return numA - numB;
    });

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #e0f2fe 100%)',
            padding: '1.5rem'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                            Sensor Dashboard
                        </h1>
                    </div>
                    <p style={{ color: '#64748b', marginLeft: '2.75rem', margin: 0 }}>
                        Node {node} - Real-time monitoring
                    </p>
                </div>

                {/* Controls Panel */}
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                    border: '1px solid #e2e8f0',
                    padding: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                        <div style={{ flex: '1', minWidth: '200px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#475569',
                                marginBottom: '0.5rem'
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                Start Time
                            </label>
                            <input
                                type="datetime-local"
                                value={timeRange.start}
                                onChange={e => setTimeRange(prev => ({ ...prev, start: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '0.625rem 1rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                            />
                        </div>
                        <div style={{ flex: '1', minWidth: '200px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#475569',
                                marginBottom: '0.5rem'
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                End Time
                            </label>
                            <input
                                type="datetime-local"
                                value={timeRange.end}
                                onChange={e => setTimeRange(prev => ({ ...prev, end: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '0.625rem 1rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                            />
                        </div>
                        <button
                            onClick={handleTimeSearch}
                            style={{
                                padding: '0.625rem 1.5rem',
                                background: '#6366f1',
                                color: 'white',
                                fontWeight: '500',
                                borderRadius: '0.5rem',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(99,102,241,0.3)',
                                transition: 'all 0.2s',
                                fontSize: '0.875rem'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#4f46e5';
                                e.target.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = '#6366f1';
                                e.target.style.transform = 'scale(1)';
                            }}
                        >
                            Search
                        </button>
                        <button
                            onClick={toggleLive}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.625rem 1.5rem',
                                background: liveMode ? '#6b7280' : '#10b981',
                                color: 'white',
                                fontWeight: '500',
                                borderRadius: '0.5rem',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: liveMode ? '0 4px 6px -1px rgba(107,114,128,0.3)' : '0 4px 6px -1px rgba(16,185,129,0.3)',
                                transition: 'all 0.2s',
                                fontSize: '0.875rem'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = liveMode ? '#4b5563' : '#059669';
                                e.target.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = liveMode ? '#6b7280' : '#10b981';
                                e.target.style.transform = 'scale(1)';
                            }}
                        >
                            {liveMode ? (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <rect x="6" y="4" width="4" height="16"></rect>
                                        <rect x="14" y="4" width="4" height="16"></rect>
                                    </svg>
                                    Pause
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                    </svg>
                                    Live
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* No Data Message */}
                {sensorIds.length === 0 && (
                    <div style={{
                        background: 'white',
                        borderRadius: '1rem',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        border: '1px solid #e2e8f0',
                        padding: '3rem',
                        textAlign: 'center'
                    }}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" style={{ margin: '0 auto 1rem' }}>
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                        <p style={{ color: '#64748b', fontSize: '1.125rem', margin: 0 }}>
                            No sensor data available for node {node}
                        </p>
                    </div>
                )}

                {/* Sensor Charts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {sensorIds.map(sensorId => {
                        const current = visibleData[sensorId] || [];
                        const totalPoints = (sensorData[sensorId] || []).length;
                        const startIndex = sliderValues[sensorId] || 0;
                        const endIndex = Math.min(startIndex + maxPoints, totalPoints);

                        const chartData = {
                            labels: current.map(r => new Date(r.timestamp).toLocaleTimeString()),
                            datasets: [
                                { 
                                    label: 'Magnitude', 
                                    data: current.map(r => r.magnitude), 
                                    borderColor: "#064FF0", 
                                    backgroundColor: "rgba(6,79,240,0.1)", 
                                    tension: 0.4, 
                                    pointRadius: 2.5, 
                                    pointHoverRadius: 5,
                                    borderWidth: 3,
                                    fill: true
                                },
                                { 
                                    label: 'Pitch', 
                                    data: current.map(r => r.pitch), 
                                    borderColor: "#F0A202", 
                                    backgroundColor: "rgba(240,162,2,0.1)", 
                                    tension: 0.4, 
                                    pointRadius: 2.5, 
                                    pointHoverRadius: 5,
                                    borderWidth: 3,
                                    fill: true
                                },
                                { 
                                    label: 'Roll', 
                                    data: current.map(r => r.roll), 
                                    borderColor: "#00A676", 
                                    backgroundColor: "rgba(0,166,118,0.1)", 
                                    tension: 0.4, 
                                    pointRadius: 2.5, 
                                    pointHoverRadius: 5,
                                    borderWidth: 3,
                                    fill: true
                                }
                            ]
                        };

                        const chartOptions = {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                x: { 
                                    ticks: { maxTicksLimit: 10, autoSkip: true },
                                    grid: { color: 'rgba(0,0,0,0.05)' }
                                },
                                y: { 
                                    beginAtZero: true,
                                    grid: { color: 'rgba(0,0,0,0.05)' }
                                }
                            },
                            animation: false,
                            plugins: { 
                                legend: { 
                                    display: true,
                                    labels: {
                                        usePointStyle: true,
                                        padding: 15,
                                        font: { size: 12, weight: '600' }
                                    }
                                }
                            },
                            interaction: {
                                intersect: false,
                                mode: 'index'
                            }
                        };

                        return (
                            <div 
                                key={sensorId}
                                style={{
                                    background: 'white',
                                    borderRadius: '1rem',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                    border: '1px solid #e2e8f0',
                                    padding: '1.5rem',
                                    transition: 'box-shadow 0.3s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#6366f1' }}></div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                                        {sensorId.replace('sensor_', 'Sensor ')}
                                    </h3>
                                </div>
                                
                                <div style={{
                                    background: '#f8fafc',
                                    borderRadius: '0.75rem',
                                    padding: '1rem',
                                    marginBottom: '1rem',
                                    height: '300px'
                                }}>
                                    <Line data={chartData} options={chartOptions} />
                                </div>

                                {/* Slider */}
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <input
                                        type="range"
                                        min="0"
                                        max={Math.max(0, totalPoints - maxPoints)}
                                        value={sliderValues[sensorId] || 0}
                                        onChange={(e) => handleSliderChange(sensorId, e.target.value)}
                                        disabled={liveMode}
                                        style={{
                                            width: '100%',
                                            height: '8px',
                                            background: '#e2e8f0',
                                            borderRadius: '4px',
                                            outline: 'none',
                                            cursor: liveMode ? 'not-allowed' : 'pointer',
                                            opacity: liveMode ? 0.5 : 1,
                                            accentColor: '#6366f1'
                                        }}
                                    />
                                </div>

                                {/* Data Range Indicator */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: '#64748b' }}>
                                        {totalPoints === 0
                                            ? "No data points"
                                            : `Viewing ${startIndex + 1}–${endIndex} of ${totalPoints} points`}
                                    </span>
                                    {liveMode && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#10b981', fontWeight: '500' }}>
                                            <span style={{
                                                position: 'relative',
                                                display: 'flex',
                                                height: '8px',
                                                width: '8px'
                                            }}>
                                                <span style={{
                                                    position: 'absolute',
                                                    display: 'inline-flex',
                                                    height: '100%',
                                                    width: '100%',
                                                    borderRadius: '50%',
                                                    background: '#10b981',
                                                    opacity: 0.75,
                                                    animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
                                                }}></span>
                                                <span style={{
                                                    position: 'relative',
                                                    display: 'inline-flex',
                                                    borderRadius: '50%',
                                                    height: '8px',
                                                    width: '8px',
                                                    background: '#10b981'
                                                }}></span>
                                            </span>
                                            Live
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <style>{`
                @keyframes ping {
                    75%, 100% {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default Graph;