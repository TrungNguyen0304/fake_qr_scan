import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Transactions from "./pages/Transactions";
import TransactionDetail from "./pages/TransactionDetail";
import Login from "./pages/Login";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
  const location = useLocation();

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

  // ProtectedRoute component
  const ProtectedRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" state={{ from: location }} replace />;
  };

  // AuthRoute to prevent logged-in users from accessing login page
  const AuthRoute = ({ children }) => {
    return !isLoggedIn ? children : <Navigate to="/transactions" replace />;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {isLoggedIn && <Sidebar onLogout={handleLogout} />}

      <div className="flex-1 flex flex-col">
        {!isLoggedIn && (
          <header className="bg-white shadow px-4 py-6 md:hidden flex justify-between items-center">
            <h1 className="text-xl font-bold text-blue-700">Fake QR Admin</h1>
          </header>
        )}

        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route
              path="/login"
              element={
                <AuthRoute>
                  <Login setIsLoggedIn={setIsLoggedIn} />
                </AuthRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions/:id"
              element={
                <ProtectedRoute>
                  <TransactionDetail />
                </ProtectedRoute>
              }
            />
            {/* Root path redirects to dashboard if logged in, else login */}
            <Route
              path="/"
              element={
                isLoggedIn ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;