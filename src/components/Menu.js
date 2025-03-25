import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Menu = ({ onAddToCart }) => {
    const [categories, setCategories] = useState([]);
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        fetchCategories();
        fetchDishes();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/categories');
            // Transform the categories data to include 'All Items' and extract names
            const transformedCategories = [
                { id: 'all', name: 'All Items' },
                ...response.data
            ];
            setCategories(transformedCategories);
            setError(null);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Failed to load menu categories');
        }
    };

    const fetchDishes = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/dishes');
            setDishes(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching dishes:', error);
            setError('Failed to load menu items');
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        setLoading(true);
        setError(null);
        fetchCategories();
        fetchDishes();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-pulse text-lg text-gray-600">Loading menu...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4">
                <div className="text-red-500 text-lg mb-4">{error}</div>
                <button
                    onClick={handleRetry}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Retry Loading Menu
                </button>
            </div>
        );
    }

    const filteredDishes = selectedCategory === 'all'
        ? dishes
        : dishes.filter(dish => dish.category_id === parseInt(selectedCategory));

    return (
        <div className="p-6 h-full bg-gray-50">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Menu</h2>
            
            {/* Categories */}
            <div className="mb-8 overflow-x-auto">
                <div className="flex space-x-2 pb-2">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-6 py-2.5 rounded-full whitespace-nowrap transition-all ${
                                selectedCategory === category.id
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-6">
                {filteredDishes.map((dish) => (
                    <div
                        key={dish.id}
                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col"
                    >
                        {dish.image_url && (
                            <div className="h-48 mb-4 overflow-hidden rounded-lg">
                                <img
                                    src={dish.image_url}
                                    alt={dish.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="flex-grow">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-semibold text-gray-800">{dish.name}</h3>
                                <span className="text-lg font-bold text-blue-600">₹{parseFloat(dish.price).toFixed(2)}</span>
                            </div>
                            <p className="text-gray-600 text-sm mb-4">{dish.description}</p>
                            <button
                                onClick={() => onAddToCart(dish)}
                                className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span>Add to Cart</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredDishes.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg">
                        No items available in this category
                    </div>
                </div>
            )}
        </div>
    );
};

export default Menu; 