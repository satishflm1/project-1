import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TakeAway = () => {
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, dishesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/categories'),
          axios.get('http://localhost:5000/api/dishes')
        ]);
        setCategories(categoriesRes.data);
        setDishes(dishesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const addToCart = (dish) => {
    setCart([...cart, { ...dish, quantity: 1 }]);
  };

  const updateQuantity = (dishId, quantity) => {
    setCart(cart.map(item => 
      item.id === dishId ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (dishId) => {
    setCart(cart.filter(item => item.id !== dishId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleOrder = async () => {
    if (!customerName || !customerPhone) {
      alert('Please fill in customer details');
      return;
    }

    if (cart.length === 0) {
      alert('Please add items to the order');
      return;
    }

    try {
      // Format items for the server
      const formattedItems = cart.map(item => ({
        dish_id: item.id,
        quantity: item.quantity,
        price: item.price,
        notes: '' // Optional notes field
      }));

      await axios.post('http://localhost:5000/api/orders', {
        customer_name: customerName,
        customer_phone: customerPhone,
        items: formattedItems,
        total_amount: calculateTotal(),
        type: 'takeaway'
      });
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Take-away Order</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Details */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Customer Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Menu</h2>
          <div className="space-y-4">
            {categories.map(category => (
              <div key={category.id}>
                <h3 className="font-semibold mb-2">{category.name}</h3>
                <div className="grid grid-cols-1 gap-2">
                  {dishes
                    .filter(dish => dish.category_id === category.id)
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

        {/* Cart Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Order Cart</h2>
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
              <p className="text-gray-500">Cart is empty</p>
            )}
            {cart.length > 0 && (
              <>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${parseFloat(calculateTotal()).toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={handleOrder}
                  className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Place Order
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeAway; 