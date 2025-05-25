import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Reports = () => {
    const [stockOutReport, setStockOutReport] = useState([]);
    const [stockStatus, setStockStatus] = useState([]);
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchReports(selectedDate);
    }, [selectedDate]);

    const fetchReports = async (date) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [stockOutRes, stockStatusRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/reports/daily-stock-out?date=${date}`, { headers }),
                axios.get(`http://localhost:5000/api/reports/stock-status?date=${date}`, { headers })
            ]);

            // Convert numeric values in stock out report
            const processedStockOut = stockOutRes.data.map(item => ({
                ...item,
                stock_out_unit_price: parseFloat(item.stock_out_unit_price),
                stock_out_total_price: parseFloat(item.stock_out_total_price)
            }));

            setStockOutReport(processedStockOut);
            setStockStatus(stockStatusRes.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch reports');
            setStockOutReport([]);
            setStockStatus([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        const printContent = document.getElementById('printable-report');
        const originalContent = document.body.innerHTML;

        // Create a print-specific stylesheet
        const style = document.createElement('style');
        style.innerHTML = `
            @media print {
                body * {
                    visibility: hidden;
                }
                #printable-report, #printable-report * {
                    visibility: visible;
                }
                #printable-report {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
                .no-print {
                    display: none !important;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f3f4f6 !important;
                    -webkit-print-color-adjust: exact;
                }
                @page {
                    size: A4;
                    margin: 2cm;
                }
            }
        `;
        document.head.appendChild(style);

        window.print();

        // Cleanup
        document.head.removeChild(style);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateTotalAmount = () => {
        return stockOutReport.reduce((total, item) => total + parseFloat(item.stock_out_total_price), 0);
    };

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div id="printable-report" className="px-4 py-6 sm:px-0">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Daily Reports</h1>
                    <div className="flex items-center space-x-4">
                        <div className="no-print">
                            <label htmlFor="date-select" className="block text-sm font-medium text-gray-700 mb-1">
                                Select Date
                            </label>
                            <input
                                type="date"
                                id="date-select"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <button
                            onClick={handlePrint}
                            className="no-print px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Print Report
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 bg-red-50 p-4 rounded-md no-print">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="mt-8">
                            <div className="text-center mb-8">
                                <h2 className="text-xl font-bold">Smart Park SIMS - Daily Stock Report</h2>
                                <p className="text-gray-600">Report for: {new Date(selectedDate).toLocaleDateString()}</p>
                            </div>

                            <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Stock Out Report</h3>
                            {stockOutReport.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">No stock out records found for this date.</p>
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
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Time
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {stockOutReport.map((item) => (
                                                            <tr key={item.id}>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    {item.name}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {item.category}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {item.stock_out_quantity}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    ${typeof item.stock_out_unit_price === 'number' ? item.stock_out_unit_price.toFixed(2) : parseFloat(item.stock_out_unit_price).toFixed(2)}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    ${typeof item.stock_out_total_price === 'number' ? item.stock_out_total_price.toFixed(2) : parseFloat(item.stock_out_total_price).toFixed(2)}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {new Date(item.stock_out_date).toLocaleTimeString()}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        <tr className="bg-gray-50">
                                                            <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                                                Total Amount:
                                                            </td>
                                                            <td colSpan="2" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                ${calculateTotalAmount().toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Stock Status Report</h3>
                            {stockStatus.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">No stock status records found for this date.</p>
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
                                                                Name
                                                            </th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Category
                                                            </th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Current Quantity
                                                            </th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Total Stock In
                                                            </th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Total Stock Out
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {stockStatus.map((item) => (
                                                            <tr key={item.id}>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    {item.name}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {item.category}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {item.current_quantity}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {item.total_stock_in}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {item.total_stock_out}
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

                        <div className="mt-8 text-center text-sm text-gray-500">
                            <p>Report generated by Smart Park SIMS</p>
                            <p>© {new Date().getFullYear()} Smart Park. All rights reserved.</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Reports; 