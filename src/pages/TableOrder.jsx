import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const API_BASE_URL = 'http://192.168.1.41:5000';
const FRONTEND_BASE_URL = 'http://192.168.1.41:3000';

const TableOrder = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [table, setTable] = useState(null);
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching table data for ID:', tableId);

      // Fetch table data
      const tableResponse = await axios.get(`${API_BASE_URL}/api/tables/${tableId}`);
      const tableData = tableResponse.data;
      console.log('Table data:', tableData);

      if (tableData.status !== 'available') {
        setError(`This table is currently ${tableData.status}. Please select a different table.`);
        setLoading(false);
        return;
      }

      setTable(tableData);

      // Fetch categories
      console.log('Fetching categories');
      const categoriesResponse = await axios.get(`${API_BASE_URL}/api/categories`);
      console.log('Categories data:', categoriesResponse.data);
      setCategories(categoriesResponse.data);

      // Fetch dishes
      console.log('Fetching dishes');
      const dishesResponse = await axios.get(`${API_BASE_URL}/api/dishes`);
      console.log('Dishes data:', dishesResponse.data);
      setDishes(dishesResponse.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error response:', error.response);
      setError(error.response?.data?.message || 'Failed to load data. Please try again later.');
      setLoading(false);
    }
  }, [tableId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addToCart = (dish) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.dish_id === dish.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.dish_id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { dish_id: dish.id, name: dish.name, price: dish.price, quantity: 1 }];
    });
  };

  const removeFromCart = (dishId) => {
    setCart(prevCart => prevCart.filter(item => item.dish_id !== dishId));
  };

  const updateQuantity = (dishId, quantity) => {
    if (quantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item.dish_id === dishId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (!cart.length) {
      alert('Please add items to your order');
      return;
    }

    try {
      const orderData = {
        table_id: tableId,
        customer_name: 'Customer',
        order_type: 'dine_in',
        items: cart.map(item => ({
          dish_id: item.dish_id,
          quantity: item.quantity,
          price: item.price,
          notes: ''
        })),
        total_amount: calculateTotal()
      };

      const response = await axios.post(`${API_BASE_URL}/api/orders`, orderData);
      setOrderId(response.data.id);
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
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
      <div className="p-6">
        <div className="bg-red-50 border border-red-500 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
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
            onClick={() => navigate('/orders')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Table {table.number}</h1>
        <p className="text-gray-600">Order for {table.capacity} people</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Menu Section */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Menu</h2>
          <div className="space-y-6">
            {categories.map(category => (
              <div key={category.id}>
                <h3 className="text-lg font-medium mb-2">{category.name}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {dishes
                    .filter(dish => dish.category_id === category.id)
                    .map(dish => (
                      <div key={dish.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{dish.name}</h4>
                            <p className="text-sm text-gray-500">{dish.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{dish.price.toFixed(2)}</p>
                            <button
                              onClick={() => addToCart(dish)}
                              className="mt-1 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your Order</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500">Your cart is empty</p>
          ) : (
            <>
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.dish_id} className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">₹{item.price.toFixed(2)}</p>
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
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold">₹{calculateTotal().toFixed(2)}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
              >
                Place Order
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableOrder; 