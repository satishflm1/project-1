import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Cart = forwardRef(({ tableId, onOrderComplete }, ref) => {
    const [cartItems, setCartItems] = useState([]);
    const [taxes, setTaxes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [showBill, setShowBill] = useState(false);
    const [billData, setBillData] = useState(null);

    // Initialize taxes
    useEffect(() => {
        console.log('Cart: Initializing'); // Debug log
        fetchTaxes();
    }, []);

    // Reset cart items when table changes
    useEffect(() => {
        console.log('Cart: Table changed to:', tableId); // Debug log
        setCartItems([]);
        setError(null);
        setSuccessMessage(''); // Clear success message when table changes
    }, [tableId]);

    useImperativeHandle(ref, () => ({
        addToCart: (dish) => {
            console.log('Cart: addToCart called with dish:', dish); // Debug log

            if (!tableId) {
                console.log('Cart: No table selected'); // Debug log
                setError('Please select a table first');
                setSuccessMessage(''); // Clear any existing success message
                return;
            }

            if (!dish) {
                console.log('Cart: No dish provided'); // Debug log
                return;
            }

            setCartItems(prevItems => {
                const existingItem = prevItems.find(item => item.id === dish.id);
                if (existingItem) {
                    console.log('Cart: Updating existing item quantity'); // Debug log
                    return prevItems.map(item =>
                        item.id === dish.id
                            ? { ...item, quantity: (parseInt(item.quantity) || 1) + 1 }
                            : item
                    );
                }
                console.log('Cart: Adding new item'); // Debug log
                return [...prevItems, { ...dish, quantity: 1 }];
            });
            setError(null);
        }
    }), [tableId]);

    const fetchTaxes = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/taxes');
            setTaxes(response.data);
            setError(null);
        } catch (err) {
            console.error('Cart: Error fetching taxes:', err);
            setError('Failed to fetch taxes');
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = (dishId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== dishId));
    };

    const updateQuantity = (dishId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(dishId);
            return;
        }
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === dishId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 0;
            return sum + (price * quantity);
        }, 0);
    };

    const calculateTax = (subtotal) => {
        return taxes.reduce((sum, tax) => {
            const percentage = parseFloat(tax.percentage) || 0;
            return sum + ((subtotal * percentage) / 100);
        }, 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const tax = calculateTax(subtotal);
        return subtotal + tax;
    };

    const handlePlaceOrder = async () => {
        if (!tableId) {
            setError('Please select a table first');
            return;
        }
        if (cartItems.length === 0) {
            setError('Cart is empty');
            return;
        }

        try {
            // Format items for the server
            const formattedItems = cartItems.map(item => ({
                dish_id: item.id,
                quantity: item.quantity,
                price: item.price,
                notes: '' // Optional notes field
            }));

            const orderData = {
                table_id: tableId,
                customer_name: 'Guest', // Default customer name
                order_type: 'dine_in', // Default to dine-in
                items: formattedItems,
                total_amount: calculateTotal()
            };

            console.log('Cart: Sending order data:', orderData);

            const response = await axios.post('http://localhost:5000/api/orders', orderData);
            console.log('Cart: Order created successfully:', response.data);

            // Generate bill
            const billResponse = await axios.get(`http://localhost:5000/api/orders/${response.data.id}/bill`);
            setBillData(billResponse.data);
            setShowBill(true);

            // Clear cart after successful order
            setCartItems([]);
            setError('');
            setSuccessMessage('Order placed successfully!');

        } catch (error) {
            console.error('Cart: Error placing order:', error.response?.data || error.message);
            setError(error.response?.data?.error || 'Failed to create order');
        }
    };

    const generatePDF = () => {
        if (!billData) {
            setError('No bill data available');
            return;
        }

        try {
            // Initialize PDF with 80mm width (converting mm to points: 80mm = 226.772 points)
            // Height is set to auto (297mm = 841.89 points)
            const doc = new jsPDF({
                unit: 'mm',
                format: [80, 297],
                orientation: 'portrait'
            });
            
            // Set initial y position
            let yPos = 10;
            
            // Add header
            doc.setFontSize(12);
            doc.text('Bill Details', 40, yPos, { align: 'center' });
            
            // Move down
            yPos += 10;
            
            // Add bill information
            doc.setFontSize(8);
            doc.text(`Order ID: ${billData.orderId}`, 5, yPos);
            yPos += 5;
            doc.text(`Table Number: T${billData.tableNumber}`, 5, yPos);
            yPos += 5;
            doc.text(`Date: ${new Date(billData.date).toLocaleString()}`, 5, yPos);
            yPos += 8;

            // Create items table
            const tableColumn = ['Item', 'Qty', 'Price', 'Total'];
            const tableRows = billData.items.map(item => {
                const price = Number(item.price);
                const quantity = Number(item.quantity);
                const total = price * quantity;
                return [
                    item.name,
                    quantity.toString(),
                    price.toFixed(2),
                    total.toFixed(2)
                ];
            });

            // Add items table using autoTable
            autoTable(doc, {
                startY: yPos,
                head: [tableColumn],
                body: tableRows,
                theme: 'plain',
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.1,
                    minCellHeight: 6
                },
                columnStyles: {
                    0: { cellWidth: 30 },    // Item name
                    1: { cellWidth: 10, halign: 'center' }, // Quantity
                    2: { cellWidth: 15, halign: 'right' },  // Price
                    3: { cellWidth: 15, halign: 'right' }   // Total
                },
                headStyles: {
                    fillColor: false,
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    halign: 'left'
                },
                margin: { left: 5, right: 5 },
                tableWidth: 70
            });

            // Get the final Y position after the table
            yPos = doc.lastAutoTable.finalY + 5;

            // Calculate totals
            const subtotal = billData.items.reduce((sum, item) => {
                const price = Number(item.price) || 0;
                const quantity = Number(item.quantity) || 0;
                return sum + (price * quantity);
            }, 0);

            const tax = subtotal * 0.1; // 10% tax
            const total = subtotal + tax;

            // Add summary with right alignment
            doc.setFontSize(8);
            doc.text(`Subtotal: ${subtotal.toFixed(2)}`, 75, yPos, { align: 'right' });
            yPos += 5;
            doc.text(`Tax: ${tax.toFixed(2)}`, 75, yPos, { align: 'right' });
            yPos += 5;
            doc.setFont(undefined, 'bold');
            doc.text(`Total: ${total.toFixed(2)}`, 75, yPos, { align: 'right' });

            // Save the PDF
            doc.save(`bill-${billData.orderId}.pdf`);
            setError(null);
        } catch (err) {
            console.error('Error generating PDF:', err);
            setError(`Failed to generate PDF: ${err.message}`);
        }
    };

    const handleCloseBill = async () => {
        try {
            // Try to generate PDF first
            generatePDF();
            
            // If PDF generation was successful, proceed with closing the bill
            await axios.patch(`http://localhost:5000/api/tables/${tableId}/status`, {
                status: 'available'
            });
            
            // Clear the bill and cart
            setShowBill(false);
            setCartItems([]);
            setSuccessMessage('Bill closed and table marked as available');
            setTimeout(() => setSuccessMessage(''), 3000);
            
            // Notify parent component if callback exists
            if (typeof onOrderComplete === 'function') {
                onOrderComplete();
            }
        } catch (err) {
            console.error('Cart: Error closing bill:', err);
            setError('Failed to close bill: ' + (err.response?.data?.message || err.message));
            setTimeout(() => setError(null), 3000);
        }
    };

    const formatCurrency = (value) => {
        const number = parseFloat(value);
        return isNaN(number) ? '0.00' : number.toFixed(2);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Cart</h2>
            
            {successMessage && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {successMessage}
                </div>
            )}

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {showBill && billData && (
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold mb-3">Bill Details</h3>
                    <div className="space-y-2">
                        <p><strong>Order ID:</strong> {billData.orderId}</p>
                        <p><strong>Table Number:</strong> {billData.tableNumber}</p>
                        <p><strong>Date:</strong> {formatDate(billData.date)}</p>
                        
                        <div className="mt-4">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Item</th>
                                        <th className="text-center py-2">Qty</th>
                                        <th className="text-right py-2">Price</th>
                                        <th className="text-right py-2">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {billData.items.map((item, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="py-2">{item.name}</td>
                                            <td className="text-center py-2">{item.quantity}</td>
                                            <td className="text-right py-2">₹{formatCurrency(item.price)}</td>
                                            <td className="text-right py-2">₹{formatCurrency(item.quantity * item.price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-b">
                                        <td colSpan="3" className="text-right py-2"><strong>Subtotal:</strong></td>
                                        <td className="text-right py-2">₹{formatCurrency(billData.subtotal)}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td colSpan="3" className="text-right py-2"><strong>Tax:</strong></td>
                                        <td className="text-right py-2">₹{formatCurrency(billData.tax)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="3" className="text-right py-2"><strong>Total:</strong></td>
                                        <td className="text-right py-2 font-bold">₹{formatCurrency(billData.total)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="mt-6 flex justify-end space-x-4">
                            <button
                                onClick={generatePDF}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download PDF
                            </button>
                            <button
                                onClick={handleCloseBill}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Close Bill
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!tableId && (
                <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                    Please select a table to start ordering
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            ) : cartItems.length === 0 ? (
                <p className="text-gray-500">Your cart is empty</p>
            ) : (
                <>
                    <div className="space-y-4 mb-6">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex justify-between items-center border-b pb-4">
                                <div>
                                    <h3 className="font-semibold">{item.name}</h3>
                                    <p className="text-gray-600">₹{parseFloat(item.price || 0).toFixed(2)}</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => updateQuantity(item.id, (parseInt(item.quantity) || 1) - 1)}
                                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center">{item.quantity || 1}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, (parseInt(item.quantity) || 1) + 1)}
                                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>₹{calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax:</span>
                            <span>₹{calculateTax(calculateSubtotal()).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span>Total:</span>
                            <span>₹{calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading}
                            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {loading ? 'Placing Order...' : 'Place Order'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
});

Cart.displayName = 'Cart';

export default Cart; 