import React, { useState } from 'react';
import Tables from './Tables';
import Menu from './Menu';
import Cart from './Cart';

const Order = () => {
    const [selectedTable, setSelectedTable] = useState(null);
    const [cartItems, setCartItems] = useState([]);

    const handleTableSelect = (table) => {
        setSelectedTable(table);
        setCartItems([]); // Clear cart when selecting a new table
    };

    const handleAddToCart = (dish) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === dish.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === dish.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevItems, { ...dish, quantity: 1 }];
        });
    };

    const handleOrderComplete = () => {
        setSelectedTable(null);
        setCartItems([]);
    };

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Left Sidebar - Tables */}
            <div className="w-1/4 bg-gray-50 border-r overflow-y-auto">
                <Tables onTableSelect={handleTableSelect} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex">
                {/* Menu Section */}
                <div className="flex-1 overflow-y-auto bg-white">
                    {selectedTable ? (
                        <Menu onAddToCart={handleAddToCart} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Please select a table to start ordering
                        </div>
                    )}
                </div>

                {/* Cart Section */}
                <div className="w-1/3 bg-gray-50 border-l overflow-y-auto">
                    {selectedTable ? (
                        <Cart
                            tableId={selectedTable.id}
                            cartItems={cartItems}
                            setCartItems={setCartItems}
                            onOrderComplete={handleOrderComplete}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Select a table to view cart
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Order; 