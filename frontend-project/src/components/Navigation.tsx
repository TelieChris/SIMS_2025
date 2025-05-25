import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { MenuIcon, XIcon } from '@heroicons/react/outline';

const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Spare Parts', href: '/spare-parts' },
    { name: 'Stock In', href: '/stock-in' },
    { name: 'Stock Out', href: '/stock-out' },
    { name: 'Reports', href: '/reports' },
];

const Navigation: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <Disclosure as="nav" className="bg-indigo-600">
            {({ open }) => (
                <>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <span className="text-white font-bold text-xl">Smart Park SIMS</span>
                                </div>
                                <div className="hidden md:block">
                                    <div className="ml-10 flex items-baseline space-x-4">
                                        {navigation.map((item) => (
                                            <Link
                                                key={item.name}
                                                to={item.href}
                                                className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <button
                                    onClick={handleLogout}
                                    className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Logout
                                </button>
                            </div>
                            <div className="-mr-2 flex md:hidden">
                                <Disclosure.Button className="bg-indigo-600 inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-indigo-700 focus:outline-none">
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

                    <Disclosure.Panel className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className="text-white hover:bg-indigo-700 block px-3 py-2 rounded-md text-base font-medium"
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="text-white hover:bg-indigo-700 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
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