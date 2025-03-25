import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Menu = ({ onAddToCart }) => {
    console.log('Menu: Rendering with onAddToCart:', !!onAddToCart); // Debug log

    const [categories, setCategories] = useState([]);
    const [dishes, setDishes] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('Menu: Component mounted'); // Debug log
        fetchCategories();
        fetchAllDishes();
    }, []);

    const fetchCategories = async () => {
        try {
            console.log('Menu: Fetching categories...'); // Debug log
            const response = await axios.get('http://localhost:5000/api/categories', {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            console.log('Menu: Categories fetched:', response.data); // Debug log
            setCategories(response.data);
            setError(null);
        } catch (err) {
            console.error('Menu: Error fetching categories:', err);
            setError('Failed to fetch categories');
        }
    };

    const fetchAllDishes = async () => {
        try {
            console.log('Menu: Fetching dishes...'); // Debug log
            const response = await axios.get('http://localhost:5000/api/dishes', {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            console.log('Menu: Dishes fetched:', response.data); // Debug log
            setDishes(response.data);
            setLoading(false);
            setError(null);
        } catch (err) {
            console.error('Menu: Error fetching dishes:', err);
            setError('Failed to fetch dishes');
            setLoading(false);
        }
    };

    const handleAddToCart = (dish) => {
        console.log('Menu: handleAddToCart called with dish:', dish); // Debug log
        if (typeof onAddToCart !== 'function') {
            console.error('Menu: onAddToCart is not a function');
            return;
        }
        onAddToCart(dish);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4">
                <div className="text-red-500 text-lg mb-4">{error}</div>
                <button
                    onClick={() => {
                        setLoading(true);
                        setError(null);
                        fetchCategories();
                        fetchAllDishes();
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Retry Loading Menu
                </button>
            </div>
        );
    }

    const filteredDishes = selectedCategory
        ? dishes.filter(dish => dish.category_id === selectedCategory)
        : dishes;

    return (
        <div className="p-6">
            {/* Categories */}
            <div className="mb-6">
                <h2 className="text-xl font-bold mb-4">Categories</h2>
                <div className="flex space-x-4 overflow-x-auto pb-2">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap
                            ${!selectedCategory 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        All Dishes
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-4 py-2 rounded-full whitespace-nowrap
                                ${selectedCategory === category.id 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Dishes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDishes.map((dish) => (
                    <div key={dish.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold mb-2">{dish.name}</h3>
                            <p className="text-gray-600 mb-4">{dish.description}</p>
                            <div className="flex justify-between items-center">
                                <span className="text-2xl font-bold text-gray-900">
                                    ₹{parseFloat(dish.price).toFixed(2)}
                                </span>
                                <button
                                    onClick={() => handleAddToCart(dish)}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredDishes.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg">
                        No dishes available in this category
                    </div>
                </div>
            )}
        </div>
    );
};

export default Menu; 