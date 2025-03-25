import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dishes = () => {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newDish, setNewDish] = useState({
    name: '',
    category_id: '',
    price: '',
    description: '',
    available: true
  });
  const [editingDish, setEditingDish] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dishesRes, categoriesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/dishes'),
        axios.get('http://localhost:5000/api/categories')
      ]);
      setDishes(dishesRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAddDish = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/dishes', newDish);
      setNewDish({
        name: '',
        category_id: '',
        price: '',
        description: '',
        available: true
      });
      fetchData();
    } catch (error) {
      console.error('Error adding dish:', error);
      alert('Failed to add dish');
    }
  };

  const handleUpdateDish = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/dishes/${editingDish.id}`, editingDish);
      setEditingDish(null);
      fetchData();
    } catch (error) {
      console.error('Error updating dish:', error);
      alert('Failed to update dish');
    }
  };

  const handleDeleteDish = async (dishId) => {
    if (window.confirm('Are you sure you want to delete this dish?')) {
      try {
        await axios.delete(`http://localhost:5000/api/dishes/${dishId}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting dish:', error);
        alert('Failed to delete dish');
      }
    }
  };

  const toggleAvailability = async (dishId, currentStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/dishes/${dishId}`, {
        available: !currentStatus
      });
      fetchData();
    } catch (error) {
      console.error('Error updating dish availability:', error);
      alert('Failed to update dish availability');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dishes</h1>

      {/* Add New Dish Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Dish</h2>
        <form onSubmit={handleAddDish} className="max-w-md">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Dish Name
            </label>
            <input
              type="text"
              value={newDish.name}
              onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={newDish.category_id}
              onChange={(e) => setNewDish({ ...newDish, category_id: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="number"
              step="0.01"
              value={newDish.price}
              onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={newDish.description}
              onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows="3"
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newDish.available}
                onChange={(e) => setNewDish({ ...newDish, available: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Available</span>
            </label>
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Add Dish
          </button>
        </form>
      </div>

      {/* Dishes List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Dishes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dishes.map(dish => (
            <div key={dish.id} className="border rounded-lg p-4">
              {editingDish?.id === dish.id ? (
                <form onSubmit={handleUpdateDish} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Dish Name
                    </label>
                    <input
                      type="text"
                      value={editingDish.name}
                      onChange={(e) => setEditingDish({ ...editingDish, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      value={editingDish.category_id}
                      onChange={(e) => setEditingDish({ ...editingDish, category_id: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingDish.price}
                      onChange={(e) => setEditingDish({ ...editingDish, price: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={editingDish.description}
                      onChange={(e) => setEditingDish({ ...editingDish, description: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingDish.available}
                        onChange={(e) => setEditingDish({ ...editingDish, available: e.target.checked })}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Available</span>
                    </label>
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
                      onClick={() => setEditingDish(null)}
                      className="flex-1 py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold">{dish.name}</h3>
                      <p className="text-sm text-gray-600">
                        {categories.find(c => c.id === dish.category_id)?.name}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingDish(dish)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDish(dish.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{dish.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">${parseFloat(dish.price).toFixed(2)}</span>
                    <button
                      onClick={() => toggleAvailability(dish.id, dish.available)}
                      className={`px-2 py-1 rounded text-sm ${
                        dish.available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {dish.available ? 'Available' : 'Unavailable'}
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

export default Dishes; 