import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/dine-in"
              className="block w-full text-center py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              New Dine-in Order
            </Link>
            <Link
              to="/take-away"
              className="block w-full text-center py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
            >
              New Take-away Order
            </Link>
            <Link
              to="/tables"
              className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Manage Tables
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <div className="space-y-2">
            <p className="text-gray-500">No recent orders</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Today's Stats</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Orders:</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between">
              <span>Total Revenue:</span>
              <span className="font-semibold">$0.00</span>
            </div>
            <div className="flex justify-between">
              <span>Active Tables:</span>
              <span className="font-semibold">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 