import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Tables = ({ onTableSelect, selectedTableId }) => {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectionError, setSelectionError] = useState(null);

    // Fetch tables when component mounts and when selectedTableId changes
    useEffect(() => {
        fetchTables();
        // Set up polling to refresh table statuses every 10 seconds
        const intervalId = setInterval(fetchTables, 10000);
        return () => clearInterval(intervalId);
    }, [selectedTableId]); // Re-fetch when selectedTableId changes

    const fetchTables = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/tables', {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            setTables(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching tables:', error);
            setError('Error loading tables');
        } finally {
            setLoading(false);
        }
    };

    const handleTableSelect = (table) => {
        if (table.status === 'occupied') {
            setSelectionError('This table is currently occupied. Please select an available table.');
            setTimeout(() => setSelectionError(null), 3000);
            return;
        }
        if (table.status === 'reserved') {
            setSelectionError('This table is reserved. Please select an available table.');
            setTimeout(() => setSelectionError(null), 3000);
            return;
        }
        setSelectionError(null);
        onTableSelect(table);
    };

    const handleRefresh = () => {
        setLoading(true);
        fetchTables();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="text-lg">Loading tables...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="text-center">
                    <div className="text-red-500 text-lg mb-4">{error}</div>
                    <button 
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Tables</h2>
                <button
                    onClick={handleRefresh}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 flex items-center"
                >
                    <span className="mr-1">Refresh</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>
            {selectionError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                    {selectionError}
                </div>
            )}
            <div className="grid grid-cols-2 gap-4">
                {tables.map((table) => {
                    const isSelected = selectedTableId === table.id;
                    const isOccupied = table.status === 'occupied';
                    const isReserved = table.status === 'reserved';
                    const isAvailable = table.status === 'available';

                    let buttonClasses = `p-4 rounded-lg text-center transition-colors ${
                        isSelected
                            ? 'bg-blue-500 text-white'
                            : isOccupied
                                ? 'bg-red-100 text-red-700 cursor-not-allowed opacity-75'
                                : isReserved
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`;

                    return (
                        <button
                            key={table.id}
                            onClick={() => handleTableSelect(table)}
                            disabled={isOccupied || isReserved}
                            className={buttonClasses}
                        >
                            <div className="text-xl font-bold">Table {table.table_number}</div>
                            <div className="text-sm mt-1">Capacity: {table.capacity}</div>
                            <div className="text-sm mt-1 capitalize">{table.status}</div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Tables; 