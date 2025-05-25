import React from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  createRoutesFromElements,
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Navigation from './components/Navigation';
import SpareParts from './components/SpareParts';
import StockIn from './components/StockIn';
import StockOut from './components/StockOut';
import Reports from './components/Reports';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? (
    <>
      <Navigation />
      {children}
    </>
  ) : (
    <Navigate to="/login" replace />
  );
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <div className="py-10">
              <h1 className="text-2xl font-bold text-center text-gray-900">
                Welcome to Smart Park SIMS
              </h1>
            </div>
          </PrivateRoute>
        }
      />
      <Route
        path="/spare-parts"
        element={
          <PrivateRoute>
            <SpareParts />
          </PrivateRoute>
        }
      />
      <Route
        path="/stock-in"
        element={
          <PrivateRoute>
            <StockIn />
          </PrivateRoute>
        }
      />
      <Route
        path="/stock-out"
        element={
          <PrivateRoute>
            <StockOut />
          </PrivateRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <Reports />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Route>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <RouterProvider router={router} />
    </div>
  );
};

export default App; 