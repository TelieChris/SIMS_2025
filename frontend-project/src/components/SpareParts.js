import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SpareParts = () => {
    const [spareParts, setSpareParts] = useState([]);
    const [newPart, setNewPart] = useState({
        name: '',
        category: '',
        quantity: 0,
        unit_price: 0
    });
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
            // Convert unit_price to number for each spare part
            const partsWithNumericPrice = response.data.map(part => ({
                ...part,
                unit_price: parseFloat(part.unit_price),
                total_price: parseFloat(part.total_price)
            }));
            setSpareParts(partsWithNumericPrice);
        } catch (err) {
            setError('Failed to fetch spare parts');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            // Ensure unit_price is a number before sending
            const partData = {
                ...newPart,
                unit_price: parseFloat(newPart.unit_price),
                quantity: parseInt(newPart.quantity)
            };
            await axios.post('http://localhost:5000/api/spare-parts', partData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Spare part added successfully');
            setNewPart({ name: '', category: '', quantity: 0, unit_price: 0 });
            fetchSpareParts();
        } catch (err) {
            setError('Failed to add spare part');
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <h1 className="text-2xl font-semibold text-gray-900">Spare Parts Management</h1>

                <div className="mt-8 bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Spare Part</h2>
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
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={newPart.name}
                                    onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    id="category"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={newPart.category}
                                    onChange={(e) => setNewPart({ ...newPart, category: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    id="quantity"
                                    required
                                    min="0"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={newPart.quantity}
                                    onChange={(e) => setNewPart({ ...newPart, quantity: parseInt(e.target.value) || 0 })}
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
                                    value={newPart.unit_price}
                                    onChange={(e) => setNewPart({ ...newPart, unit_price: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Add Spare Part
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Spare Parts List</h2>
                    <div className="flex flex-col">
                        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Category
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Quantity
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Unit Price
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Total Price
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {spareParts.map((part) => (
                                                <tr key={part.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {part.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {part.category}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {part.quantity}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        Frw{typeof part.unit_price === 'number' ? part.unit_price.toFixed(2) : parseFloat(part.unit_price).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        Frw{typeof part.total_price === 'number' ? part.total_price.toFixed(2) : parseFloat(part.total_price).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpareParts; 
