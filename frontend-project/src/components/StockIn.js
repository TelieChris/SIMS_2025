import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StockIn = () => {
    const [spareParts, setSpareParts] = useState([]);
    const [selectedPart, setSelectedPart] = useState('');
    const [quantity, setQuantity] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [stockInRecords, setStockInRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSpareParts();
        fetchStockInRecords();
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

    const fetchStockInRecords = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/stock-in', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStockInRecords(response.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch stock in records');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/stock-in', {
                spare_part_id: parseInt(selectedPart),
                stock_in_quantity: parseInt(quantity)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Stock in recorded successfully');
            setSelectedPart('');
            setQuantity('');
            fetchSpareParts();
            fetchStockInRecords();
        } catch (err) {
            setError('Failed to record stock in');
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <h1 className="text-2xl font-semibold text-gray-900">Stock In Management</h1>

                <div className="mt-8 bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Record Stock In</h2>
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
                                onChange={(e) => setSelectedPart(e.target.value)}
                            >
                                <option value="">Select a spare part</option>
                                {spareParts.map((part) => (
                                    <option key={part.id} value={part.id}>
                                        {part.name} - {part.category} (Current: {part.quantity})
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
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Record Stock In
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-8 bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Stock In Records</h2>
                    {loading ? (
                        <div className="text-center py-4">
                            <p className="text-gray-500">Loading...</p>
                        </div>
                    ) : stockInRecords.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-gray-500">No stock in records found.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Spare Part
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Category
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Quantity
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Date
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {stockInRecords.map((record) => (
                                                    <tr key={record.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {record.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {record.category}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {record.stock_in_quantity}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(record.stock_in_date).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StockIn; 