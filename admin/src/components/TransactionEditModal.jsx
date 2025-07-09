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
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSave = async () => {
    // Validate status
    if (!["success", "failed"].includes(formData.status)) {
      alert("Vui lòng chọn trạng thái hợp lệ (Thành công hoặc Thất bại).");
      return;
    }

    setIsLoading(true);
    setSuccessMessage(null);
    try {
      await onSave();
      setSuccessMessage("Cập nhật trạng thái thành công!");
      setTimeout(() => {
        setSuccessMessage(null);
        onCancel(); // Close modal after success
      }, 1500);
    } catch (error) {
      console.error("Lỗi khi lưu trạng thái:", error);
      alert(error.message || "Cập nhật trạng thái thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800/70 flex items-center justify-center z-50 transition-all duration-300 px-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg transform transition-all duration-300 border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Chỉnh sửa giao dịch
              </h2>
              <p className="text-sm text-gray-500">#{editingTx?.id}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all duration-200"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-700 font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Warning Message */}
        {editingTx?.isUpdated && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-yellow-700 font-medium">
                Giao dịch đã được cập nhật trước đó và không thể chỉnh sửa trạng thái.
              </p>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Client ID */}
          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client ID
            </label>
            <div className="relative">
              <input
                type="text"
                name="clientId"
                value={formData.clientId}
                disabled
                className="w-full rounded-lg border border-gray-300 bg-gray-50 text-gray-600 px-4 py-2 text-sm transition-all duration-200 cursor-not-allowed"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số tiền
            </label>
            <div className="relative">
              <input
                type="text"
                name="amount"
                value={new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(formData.amount)}
                disabled
                className="w-full rounded-lg border border-gray-300 bg-gray-50 text-gray-600 px-4 py-2 text-sm transition-all duration-200 cursor-not-allowed"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Trạng thái
            </label>
            <div className="flex space-x-4">
                            <button
                type="button"
                onClick={() => onInputChange({ target: { name: "status", value: "failed" } })}
                disabled={editingTx?.isUpdated}
                className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  formData.status === "failed"
                    ? "bg-red-500 text-white shadow-md"
                    : editingTx?.isUpdated
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-600 border border-gray-300"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Thất bại</span>
                </div>
              </button>
                            <button
                type="button"
                onClick={() => onInputChange({ target: { name: "status", value: "success" } })}
                disabled={editingTx?.isUpdated}
                className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  formData.status === "success"
                    ? "bg-green-500 text-white shadow-md"
                    : editingTx?.isUpdated
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-600 border border-gray-300"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Thành công</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-all duration-200"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={editingTx?.isUpdated || isLoading || !formData.status}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              editingTx?.isUpdated || isLoading || !formData.status
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600 shadow-md"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
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
                <span>Đang lưu...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>Lưu</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionEditModal;