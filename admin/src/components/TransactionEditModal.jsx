import React, { useState } from "react";

const TransactionEditModal = ({
  isOpen,
  editingTx,
  formData,
  onInputChange,
  onSave,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    // Validate that a valid status is selected
    if (!["success", "failed"].includes(formData.status)) {
      alert("Vui lòng chọn trạng thái hợp lệ (Thành công hoặc Thất bại).");
      return;
    }

    setIsLoading(true);
    try {
      await onSave();
    } catch (error) {
      console.error("Lỗi khi lưu trạng thái:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300 px-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Chỉnh sửa giao dịch #{editingTx?.id}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Client ID
            </label>
            <input
              type="text"
              name="clientId"
              value={formData.clientId}
              disabled
              className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed shadow-sm p-2 text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Số tiền
            </label>
            <input
              type="text"
              name="amount"
              value={new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(formData.amount)}
              disabled
              className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed shadow-sm p-2 text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={onInputChange}
              disabled={editingTx?.isUpdated}
              className={`mt-1 block w-full border rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors p-2 text-sm sm:text-base ${
                editingTx?.isUpdated
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : ""
              }`}
            >
              <option value="" disabled>
                Chọn trạng thái
              </option>
              <option value="success">Thành công</option>
              <option value="failed">Thất bại</option>
            </select>
          </div>
        </div>
        <div className="mt-6 sm:mt-8 flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 sm:px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={editingTx?.isUpdated || isLoading || !formData.status}
            className={`px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors relative ${
              editingTx?.isUpdated || isLoading || !formData.status
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang lưu...
              </div>
            ) : (
              "Lưu"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionEditModal;