import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-800">
                Bighorn POS
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-gray-600">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header; 