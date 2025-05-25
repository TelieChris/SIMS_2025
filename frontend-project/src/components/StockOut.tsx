import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface SparePart {
    id: number;
    name: string;
    category: string;
    quantity: number;
    unit_price: number;
}

const StockOut: React.FC = () => {
    const [spareParts, setSpareParts] = useState<SparePart[]>([]);
    const [selectedPart, setSelectedPart] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchSpareParts();
    }, []);

    const fetchSpareParts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/spare-parts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSpareParts(response.data);
        } catch (err) {
            setError('Failed to fetch spare parts');
        }
    };

    const handlePartSelect = (partId: string) => {
        setSelectedPart(partId);
        const part = spareParts.find(p => p.id === parseInt(partId));
        if (part) {
            setUnitPrice(part.unit_price.toString());
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const selectedPartObj = spareParts.find(p => p.id === parseInt(selectedPart));
            if (!selectedPartObj) {
                setError('Please select a spare part');
                return;
            }

            if (parseInt(quantity) > selectedPartObj.quantity) {
                setError('Insufficient stock quantity');
                return;
            }

            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/stock-out', {
                spare_part_id: parseInt(selectedPart),
                stock_out_quantity: parseInt(quantity),
                stock_out_unit_price: parseFloat(unitPrice)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Stock out recorded successfully');
            setSelectedPart('');
            setQuantity('');
            setUnitPrice('');
            fetchSpareParts();
        } catch (err) {
            setError('Failed to record stock out');
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <h1 className="text-2xl font-semibold text-gray-900">Stock Out Management</h1>

                <div className="mt-8 bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Record Stock Out</h2>
                    {error && (
                        <div className="mb-4 bg-red-50 p-4 rounded-md">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 bg-green-50 p-4 rounded-md">
                            <p className="text-sm text-green-700">{success}</p>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="spare_part" className="block text-sm font-medium text-gray-700">
                                Spare Part
                            </label>
                            <select
                                id="spare_part"
                                required
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                value={selectedPart}
                                onChange={(e) => handlePartSelect(e.target.value)}
                            >
                                <option value="">Select a spare part</option>
                                {spareParts.map((part) => (
                                    <option key={part.id} value={part.id}>
                                        {part.name} - {part.category} (Available: {part.quantity})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                                Quantity
                            </label>
                            <input
                                type="number"
                                id="quantity"
                                required
                                min="1"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="unit_price" className="block text-sm font-medium text-gray-700">
                                Unit Price
                            </label>
                            <input
                                type="number"
                                id="unit_price"
                                required
                                min="0"
                                step="0.01"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={unitPrice}
                                onChange={(e) => setUnitPrice(e.target.value)}
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Record Stock Out
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StockOut; 