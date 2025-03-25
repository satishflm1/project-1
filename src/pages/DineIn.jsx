import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DineIn = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tablesRes, categoriesRes, dishesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/tables'),
        axios.get('http://localhost:5000/api/categories'),
        axios.get('http://localhost:5000/api/dishes')
      ]);

      setTables(tablesRes.data);
      setCategories(categoriesRes.data);
      setDishes(dishesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
      setLoading(false);
    }
  };

  const handleTableSelect = (table) => {
    if (table.status !== 'available') {
      alert('This table is not available');
      return;
    }
    setSelectedTable(table);
    setCart([]);
  };

  const addToCart = (dish) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === dish.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...dish, quantity: 1 }];
    });
  };

  const updateQuantity = (dishId, quantity) => {
    if (quantity < 1) {
      removeFromCart(dishId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === dishId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (dishId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== dishId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (!selectedTable) {
      alert('Please select a table first');
      return;
    }

    if (cart.length === 0) {
      alert('Please add items to your order');
      return;
    }

    try {
      const orderData = {
        table_id: selectedTable.id,
        customer_name: 'Guest',
        order_type: 'dine_in',
        items: cart.map(item => ({
          dish_id: item.id,
          quantity: item.quantity,
          price: item.price,
          notes: ''
        })),
        total_amount: calculateTotal()
      };

      await axios.post('http://localhost:5000/api/orders', orderData);
      alert('Order placed successfully!');
      setCart([]);
      setSelectedTable(null);
      fetchData(); // Refresh table status
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dine-In Orders</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tables Section */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Select Table</h2>
            <div className="grid grid-cols-2 gap-4">
              {tables.map(table => (
                <button
                  key={table.id}
                  onClick={() => handleTableSelect(table)}
                  className={`p-4 border rounded-lg text-center ${
                    selectedTable?.id === table.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">Table {table.number}</div>
                  <div className="text-sm text-gray-500">Capacity: {table.capacity}</div>
                  <span className={`mt-2 inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(table.status)}`}>
                    {table.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className="lg:col-span-2">
          {selectedTable ? (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Menu - Table {selectedTable.number}</h2>
                <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(selectedTable.status)}`}>
                  {selectedTable.status}
                </span>
              </div>
              <div className="space-y-4">
                {categories.map(category => (
                  <div key={category.id}>
                    <h3 className="font-semibold mb-2">{category.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {dishes
                        .filter(dish => dish.category_id === category.id && dish.available)
                        .map(dish => (
                          <button
                            key={dish.id}
                            onClick={() => addToCart(dish)}
                            className="text-left p-2 border rounded hover:bg-gray-50"
                          >
                            <div className="font-medium">{dish.name}</div>
                            <div className="text-sm text-gray-500">
                              ${parseFloat(dish.price).toFixed(2)}
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <p className="text-gray-500">Please select a table to view the menu</p>
            </div>
          )}
        </div>

        {/* Cart Section */}
        {selectedTable && (
          <div className="lg:col-span-3">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Your Order - Table {selectedTable.number}</h2>
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        ${parseFloat(item.price).toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                        className="w-16 p-1 border rounded"
                      />
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {cart.length === 0 && (
                  <p className="text-gray-500">Your cart is empty</p>
                )}
                {cart.length > 0 && (
                  <>
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      onClick={handlePlaceOrder}
                      className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      Place Order
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DineIn; 