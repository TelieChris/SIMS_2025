import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { MenuIcon, XIcon } from '@heroicons/react/outline';

const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Spare Parts', href: '/spare-parts' },
    { name: 'Stock In', href: '/stock-in' },
    { name: 'Stock Out', href: '/stock-out' },
    { name: 'Reports', href: '/reports' },
];

const Navigation = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <Disclosure as="nav" className="bg-indigo-600 shadow-lg">
            {({ open }) => (
                <>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex">
                                <div className="flex-shrink-0 flex items-center">
                                    <span className="text-white text-xl font-bold">Smart Park SIMS</span>
                                </div>
                                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={`${
                                                location.pathname === item.href
                                                    ? 'border-white text-white'
                                                    : 'border-transparent text-indigo-100 hover:border-indigo-300 hover:text-white'
                                            } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:items-center">
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                                >
                                    Logout
                                </button>
                            </div>
                            <div className="-mr-2 flex items-center sm:hidden">
                                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-indigo-100 hover:text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <XIcon className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </Disclosure.Button>
                            </div>
                        </div>
                    </div>

                    <Disclosure.Panel className="sm:hidden">
                        <div className="pt-2 pb-3 space-y-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`${
                                        location.pathname === item.href
                                            ? 'bg-indigo-700 border-indigo-500 text-white'
                                            : 'border-transparent text-indigo-100 hover:bg-indigo-700 hover:border-indigo-500 hover:text-white'
                                    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-indigo-100 hover:bg-indigo-700 hover:border-indigo-500 hover:text-white transition-colors duration-200"
                            >
                                Logout
                            </button>
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    );
};

export default Navigation; 