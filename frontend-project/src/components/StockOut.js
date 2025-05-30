import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StockOut = () => {
    const [spareParts, setSpareParts] = useState([]);
    const [selectedPart, setSelectedPart] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [stockOutRecords, setStockOutRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchSpareParts();
        fetchStockOutRecords();
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

    const fetchStockOutRecords = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/stock-out', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStockOutRecords(response.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch stock out records');
        } finally {
            setLoading(false);
        }
    };

    const handlePartSelect = (partId) => {
        setSelectedPart(partId);
        const part = spareParts.find(p => p.id === parseInt(partId));
        if (part) {
            setUnitPrice(part.unit_price.toString());
        }
    };

    const resetForm = () => {
        setSelectedPart('');
        setQuantity('');
        setUnitPrice('');
        setEditingRecord(null);
        setIsEditing(false);
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        setSelectedPart(record.spare_part_id ? record.spare_part_id.toString() : '');
        setQuantity(record.stock_out_quantity.toString());
        setUnitPrice(record.stock_out_unit_price.toString());
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this record?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`http://localhost:5000/api/stock-out/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const record = stockOutRecords.find(r => r.id === id);
            setSuccess(`Stock out record deleted successfully. ${record.name}'s stock quantity has been increased by ${record.stock_out_quantity}.`);
            
            fetchStockOutRecords();
            fetchSpareParts();
        } catch (err) {
            setError('Failed to delete stock out record');
            console.error('Error:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!selectedPart) {
                setError('Please select a spare part');
                return;
            }

            const selectedPartObj = spareParts.find(p => p.id === parseInt(selectedPart));
            if (!selectedPartObj) {
                setError('Please select a valid spare part');
                return;
            }

            if (!quantity || parseInt(quantity) <= 0) {
                setError('Please enter a valid quantity');
                return;
            }

            if (!unitPrice || parseFloat(unitPrice) <= 0) {
                setError('Please enter a valid unit price');
                return;
            }

            if (!isEditing && parseInt(quantity) > selectedPartObj.quantity) {
                setError('Insufficient stock quantity');
                return;
            }

            const token = localStorage.getItem('token');
            const data = {
                spare_part_id: parseInt(selectedPart),
                stock_out_quantity: parseInt(quantity),
                stock_out_unit_price: parseFloat(unitPrice)
            };

            let successMessage = '';

            if (isEditing && editingRecord) {
                const response = await axios.put(`http://localhost:5000/api/stock-out/${editingRecord.id}`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (editingRecord.spare_part_id !== parseInt(selectedPart)) {
                    // If spare part was changed
                    const oldPart = spareParts.find(p => p.id === editingRecord.spare_part_id);
                    const newPart = selectedPartObj;
                    successMessage = `Stock out record updated successfully. Returned ${editingRecord.stock_out_quantity} units to ${oldPart.name} and removed ${quantity} units from ${newPart.name}.`;
                } else {
                    // If only quantity was changed
                    const quantityDiff = editingRecord.stock_out_quantity - parseInt(quantity);
                    if (quantityDiff > 0) {
                        successMessage = `Stock out record updated successfully. Returned ${quantityDiff} units to ${selectedPartObj.name}'s stock.`;
                    } else if (quantityDiff < 0) {
                        successMessage = `Stock out record updated successfully. Removed ${Math.abs(quantityDiff)} additional units from ${selectedPartObj.name}'s stock.`;
                    } else {
                        successMessage = 'Stock out record updated successfully. Stock quantities remain unchanged.';
                    }
                }
            } else {
                await axios.post('http://localhost:5000/api/stock-out', data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                successMessage = `Stock out recorded successfully. Removed ${quantity} units from ${selectedPartObj.name}'s stock.`;
            }

            setSuccess(successMessage);
            resetForm();
            fetchSpareParts();
            fetchStockOutRecords();
        } catch (err) {
            setError(isEditing ? 'Failed to update stock out record' : 'Failed to record stock out');
            console.error('Error:', err);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <h1 className="text-2xl font-semibold text-gray-900">Stock Out Management</h1>

                <div className="mt-8 bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {isEditing ? 'Edit Stock Out Record' : 'Record Stock Out'}
                    </h2>
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
                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {isEditing ? 'Update Record' : 'Record Stock Out'}
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="mt-8 bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Stock Out Records</h2>
                    {loading ? (
                        <div className="text-center py-4">
                            <p className="text-gray-500">Loading...</p>
                        </div>
                    ) : stockOutRecords.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-gray-500">No stock out records found.</p>
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
                                                        Unit Price
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Total Price
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Date
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {stockOutRecords.map((record) => (
                                                    <tr key={record.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {record.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {record.category}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {record.stock_out_quantity}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            Frw{parseFloat(record.stock_out_unit_price).toFixed(2)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            Frw{parseFloat(record.stock_out_total_price).toFixed(2)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(record.stock_out_date).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => handleEdit(record)}
                                                                    className="text-indigo-600 hover:text-indigo-900"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(record.id)}
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
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

export default StockOut; 