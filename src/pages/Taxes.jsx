import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaxPage = () => {
  const [taxes, setTaxes] = useState([]);
  const [newTax, setNewTax] = useState({ tax_name: '', percentage: '' });
  const [editingTax, setEditingTax] = useState(null);

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/taxes');
      setTaxes(response.data);
    } catch (error) {
      console.error('Error fetching taxes:', error);
    }
  };

  const handleAddTax = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/taxes', newTax);
      setNewTax({ tax_name: '', percentage: '' });
      fetchTaxes();
    } catch (error) {
      console.error('Error adding tax:', error);
      alert('Failed to add tax');
    }
  };

  const handleUpdateTax = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/taxes/${editingTax.id}`, editingTax);
      setEditingTax(null);
      fetchTaxes();
    } catch (error) {
      console.error('Error updating tax:', error);
      alert('Failed to update tax');
    }
  };

  const handleDeleteTax = async (taxId) => {
    if (window.confirm('Are you sure you want to delete this tax?')) {
      try {
        await axios.delete(`http://localhost:5000/api/taxes/${taxId}`);
        fetchTaxes();
      } catch (error) {
        console.error('Error deleting tax:', error);
        alert('Failed to delete tax');
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Taxes</h1>

      {/* Add New Tax Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Tax</h2>
        <form onSubmit={handleAddTax} className="max-w-md">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Tax Name
            </label>
            <input
              type="text"
              value={newTax.tax_name}
              onChange={(e) => setNewTax({ ...newTax, tax_name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Percentage
            </label>
            <input
              type="number"
              step="0.01"
              value={newTax.percentage}
              onChange={(e) => setNewTax({ ...newTax, percentage: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Add Tax
          </button>
        </form>
      </div>

      {/* Taxes List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Taxes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {taxes.map(tax => (
            <div key={tax.id} className="border rounded-lg p-4">
              {editingTax?.id === tax.id ? (
                <form onSubmit={handleUpdateTax} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tax Name
                    </label>
                    <input
                      type="text"
                      value={editingTax.tax_name}
                      onChange={(e) => setEditingTax({ ...editingTax, tax_name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Percentage
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingTax.percentage}
                      onChange={(e) => setEditingTax({ ...editingTax, percentage: e.target.value })}
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
                      onClick={() => setEditingTax(null)}
                      className="flex-1 py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{tax.tax_name}</h3>
                    <p className="text-sm text-gray-600">{tax.percentage}%</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingTax(tax)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTax(tax.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaxPage; 