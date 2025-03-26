import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

const API_BASE_URL = 'http://192.168.1.41:5000';
const FRONTEND_BASE_URL = 'http://192.168.1.41:3000';

const DineIn = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);

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

      const response = await axios.post(`${API_BASE_URL}/api/orders`, orderData);
      setOrderId(response.data.id);
      alert('Order placed successfully!');
      setCart([]);
      setSelectedTable(null);
      fetchData(); // Refresh table status
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    }
  };

  const handleDownloadBill = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/orders/${orderId}/bill`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bill-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error generating bill:', error);
      alert('Failed to generate bill');
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

  if (orderId) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-6">Scan the QR code below to view your bill details</p>
          <div className="flex justify-center mb-6">
            <QRCodeSVG
              value={`${FRONTEND_BASE_URL}/bill/${orderId}`}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          <button
            onClick={handleDownloadBill}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
          >
            Download Bill
          </button>
          <button
            onClick={() => setOrderId(null)}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Place New Order
          </button>
        </div>
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
                          <div key={dish.id} className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{dish.name}</h3>
                              <p className="text-sm text-gray-500">{dish.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">₹{Number(dish.price).toFixed(2)}</p>
                              <button
                                onClick={() => addToCart(dish)}
                                className="mt-1 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                              >
                                Add to Cart
                              </button>
                            </div>
                          </div>
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
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">₹{Number(item.price).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.dish_id, item.quantity - 1)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.dish_id, item.quantity + 1)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.dish_id)}
                        className="text-red-600 hover:text-red-900"
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
                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-xl font-bold">₹{Number(calculateTotal()).toFixed(2)}</span>
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