import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiList, FiLogOut, FiMenu, FiX } from "react-icons/fi";

const Sidebar = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const navClass = ({ isActive }) =>
    isActive
      ? "flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg transition"
      : "flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition";

  const handleLogout = () => {
    onLogout();
    setShowLogoutModal(false);
    setIsOpen(false);
    navigate("/login");
  };

  return (
    <>
      {/* Hamburger button for mobile */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow"
        onClick={toggleSidebar}
        aria-label="Toggle Sidebar"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static overflow-y-auto flex flex-col h-full md:h-auto`}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-blue-700">Fake QR Admin</h2>
        </div>

        {/* Nav links */}
        <nav className="p-4 flex flex-col gap-2">
          <NavLink
            to="/transactions"
            className={navClass}
            onClick={() => setIsOpen(false)}
          >
            <FiList size={20} /> Giao dịch
          </NavLink>
        </nav>

        {/* Spacer to push logout to bottom */}
        <div className="flex-grow"></div>

        {/* Logout button */}
        <div className="p-4 border-t border-gray-200">
          <button
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition"
            onClick={() => {
              setShowLogoutModal(true);
              setIsOpen(false);
            }}
          >
            <FiLogOut size={20} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Overlay when mobile sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Xác nhận đăng xuất</h3>
            <p className="text-gray-600 mb-6">Bạn có chắc muốn đăng xuất?</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                onClick={() => setShowLogoutModal(false)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
