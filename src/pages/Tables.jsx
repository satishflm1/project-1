import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

const API_BASE_URL = 'http://192.168.1.41:5000';
const FRONTEND_BASE_URL = 'http://192.168.1.41:3000';

const TableManagementPage = () => {
  const [tables, setTables] = useState([]);
  const [newTable, setNewTable] = useState({ table_number: '', capacity: '' });
  const [editingTable, setEditingTable] = useState(null);
  const [error, setError] = useState(null);
  const [showQRCode, setShowQRCode] = useState(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tables`);
      setTables(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setError('Failed to fetch tables');
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/tables`, {
        table_number: newTable.table_number,
        capacity: parseInt(newTable.capacity)
      });
      setNewTable({ table_number: '', capacity: '' });
      setError(null);
      fetchTables();
    } catch (error) {
      console.error('Error adding table:', error);
      setError(error.response?.data?.message || 'Failed to add table');
    }
  };

  const handleUpdateTable = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/api/tables/${editingTable.id}`, editingTable);
      setEditingTable(null);
      fetchTables();
    } catch (error) {
      console.error('Error updating table:', error);
      alert('Failed to update table');
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/tables/${tableId}`);
        fetchTables();
      } catch (error) {
        console.error('Error deleting table:', error);
        alert('Failed to delete table');
      }
    }
  };

  const handleStatusChange = async (tableId, newStatus) => {
    try {
      const table = tables.find(t => t.id === tableId);
      if (!table) return;

      await axios.put(`${API_BASE_URL}/api/tables/${tableId}`, {
        number: table.number,
        capacity: table.capacity,
        status: newStatus
      });
      fetchTables();
    } catch (error) {
      console.error('Error updating table status:', error);
      alert('Failed to update table status');
    }
  };

  const handleResetAllTables = async () => {
    if (window.confirm('Are you sure you want to reset all tables to available status?')) {
      try {
        await axios.post(`${API_BASE_URL}/api/tables/reset`);
        fetchTables();
      } catch (error) {
        console.error('Error resetting tables:', error);
        setError('Failed to reset tables');
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Table Management</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-500 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Add New Table Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Table</h2>
        <form onSubmit={handleAddTable} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Table Number
            </label>
            <input
              type="text"
              value={newTable.table_number}
              onChange={(e) => setNewTable({ ...newTable, table_number: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              placeholder="e.g., T1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Capacity
            </label>
            <input
              type="number"
              value={newTable.capacity}
              onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              min="1"
              placeholder="Number of seats"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              Add Table
            </button>
          </div>
        </form>
      </div>

      {/* Tables List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Tables</h2>
          <button
            onClick={handleResetAllTables}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Reset All Tables
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map(table => (
            <div key={table.id} className="border rounded-lg p-4">
              {editingTable?.id === table.id ? (
                <form onSubmit={handleUpdateTable} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Table Number
                    </label>
                    <input
                      type="text"
                      value={editingTable.table_number}
                      onChange={(e) => setEditingTable({ ...editingTable, table_number: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Capacity
                    </label>
                    <input
                      type="number"
                      value={editingTable.capacity}
                      onChange={(e) => setEditingTable({ ...editingTable, capacity: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTable(null)}
                      className="flex-1 py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Table {table.number}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingTable(table)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTable(table.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    Capacity: {table.capacity} seats
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusChange(table.id, 'available')}
                      className={`flex-1 py-1 px-2 rounded text-sm ${
                        table.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      Available
                    </button>
                    <button
                      onClick={() => handleStatusChange(table.id, 'occupied')}
                      className={`flex-1 py-1 px-2 rounded text-sm ${
                        table.status === 'occupied'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      Occupied
                    </button>
                    <button
                      onClick={() => handleStatusChange(table.id, 'reserved')}
                      className={`flex-1 py-1 px-2 rounded text-sm ${
                        table.status === 'reserved'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      Reserved
                    </button>
                  </div>
                  <div className="flex justify-center mb-4">
                    <button
                      onClick={() => setShowQRCode(table.id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      View QR Code
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Table QR Code</h2>
              <button
                onClick={() => setShowQRCode(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col items-center">
              <QRCodeSVG
                value={`${FRONTEND_BASE_URL}/table/${showQRCode}`}
                size={200}
                level="H"
                includeMargin={true}
              />
              <p className="mt-4 text-gray-600 text-center">
                Scan this QR code to place an order for this table
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManagementPage; 