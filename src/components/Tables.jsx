import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Tables = ({ onTableSelect, selectedTableId }) => {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ available: 0, occupied: 0, reserved: 0 });

    useEffect(() => {
        fetchTables();
        const interval = setInterval(fetchTables, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchTables = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/tables', {
                headers: { 'Cache-Control': 'no-cache' }
            });
            setTables(response.data);
            
            // Calculate stats
            const newStats = response.data.reduce((acc, table) => {
                acc[table.status] = (acc[table.status] || 0) + 1;
                return acc;
            }, {});
            setStats(newStats);
            
            setError(null);
        } catch (err) {
            console.error('Tables: Error fetching tables:', err);
            setError('Failed to fetch tables');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleTableSelect = async (table) => {
        if (table.status === 'occupied' && table.id !== selectedTableId) {
            setError('This table is currently occupied');
            setTimeout(() => setError(null), 3000);
            return;
        }
        if (table.status === 'reserved') {
            setError('This table is reserved');
            setTimeout(() => setError(null), 3000);
            return;
        }
        
        try {
            if (table.id !== selectedTableId) {
                await axios.patch(`http://localhost:5000/api/tables/${table.id}/status`, {
                    status: 'occupied'
                });
                onTableSelect(table);
            }
        } catch (err) {
            console.error('Tables: Error updating table status:', err);
            setError('Failed to select table');
            setTimeout(() => setError(null), 3000);
        }
    };

    const resetTables = async () => {
        try {
            setRefreshing(true);
            await axios.post('http://localhost:5000/api/tables/reset');
            await fetchTables();
            setError(null);
        } catch (err) {
            console.error('Tables: Error resetting tables:', err);
            setError('Failed to reset tables');
            setTimeout(() => setError(null), 3000);
        }
    };

    const getTableColor = (status, isSelected) => {
        if (isSelected) return 'bg-blue-100 border-blue-500 text-blue-700 shadow-blue-100';
        switch (status) {
            case 'available':
                return 'bg-green-50 border-green-500 text-green-700 hover:bg-green-100 shadow-green-100';
            case 'occupied':
                return 'bg-red-50 border-red-500 text-red-700 cursor-not-allowed shadow-red-100';
            case 'reserved':
                return 'bg-yellow-50 border-yellow-500 text-yellow-700 cursor-not-allowed shadow-yellow-100';
            default:
                return 'bg-gray-50 border-gray-500 text-gray-700 shadow-gray-100';
        }
    };

    return (
        <div className="p-6 h-full flex flex-col">
            {/* Header with Stats */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Tables</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={resetTables}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-500 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50"
                            title="Reset all tables to available"
                        >
                            <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Reset All</span>
                        </button>
                        <button
                            onClick={() => { setRefreshing(true); fetchTables(); }}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                            title="Refresh tables"
                        >
                            <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-green-700 text-sm font-medium">Available</div>
                        <div className="text-2xl font-bold text-green-800">{stats.available || 0}</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="text-red-700 text-sm font-medium">Occupied</div>
                        <div className="text-2xl font-bold text-red-800">{stats.occupied || 0}</div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="text-yellow-700 text-sm font-medium">Reserved</div>
                        <div className="text-2xl font-bold text-yellow-800">{stats.reserved || 0}</div>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-500 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="flex-1 flex justify-center items-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                        <p className="text-gray-600">Loading tables...</p>
                    </div>
                </div>
            ) : (
                /* Tables Grid */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 flex-1 overflow-y-auto">
                    {tables.map(table => (
                        <button
                            key={table.id}
                            onClick={() => handleTableSelect(table)}
                            disabled={table.status === 'occupied' && table.id !== selectedTableId || table.status === 'reserved'}
                            className={`relative p-4 rounded-xl border-2 transition-all transform hover:scale-105 hover:shadow-lg ${getTableColor(table.status, table.id === selectedTableId)}`}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="absolute -top-2 -right-2">
                                    <span className={`w-4 h-4 rounded-full block ${
                                        table.status === 'available' ? 'bg-green-500' :
                                        table.status === 'occupied' ? 'bg-red-500' : 'bg-yellow-500'
                                    }`}></span>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Table {table.table_number}</h3>
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span className="text-sm">{table.capacity} seats</span>
                                </div>
                                <div className="text-sm font-medium capitalize">
                                    {table.status}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Tables; 