import React, { useEffect, useState } from "react";
import {
  Search,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Loader2,
} from "lucide-react";
import TransactionEditModal from "../components/TransactionEditModal";
import { MdOutlineQrCodeScanner } from "react-icons/md";

// TransactionRow Component
const TransactionRow = ({ tx, onEdit, onDelete }) => {
const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "scanned":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "scanned":
        return <MdOutlineQrCodeScanner className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusText = (status) => {
    switch (status) {
      case "success":
        return "Thành công";
      case "failed":
        return "Thất bại";
      case "pending":
        return "Đang xử lý";
      case "scanned":
        return "Đã quét";
      default:
        return status;
    }
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-2 py-3 sm:px-4 sm:py-4">
        <div className="font-medium text-gray-900 text-sm sm:text-base">
          #{tx.id}
        </div>
      </td>
      <td className="px-2 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center justify-center">
          <div className="text-gray-900 font-medium text-sm sm:text-base">
            {tx.clientId}
          </div>
        </div>
      </td>
      <td className="px-2 py-3 sm:px-4 sm:py-4 text-right">
        <div className="font-semibold text-gray-900 text-sm sm:text-base">
          {formatAmount(tx.amount)}
        </div>
      </td>
      <td className="px-2 py-3 sm:px-4 sm:py-4 text-center">
        <span
          className={`inline-flex items-center justify-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium border ${getStatusColor(
            tx.status
          )}`}
        >
          {getStatusIcon(tx.status)}
          <span className="ml-1">{getStatusText(tx.status)}</span>
        </span>
      </td>
      <td className="px-2 py-3 sm:px-4 sm:py-4 text-right">
        <div className="flex items-center justify-end space-x-1 sm:space-x-2">
          <button
            className={`p-1 sm:p-2 text-gray-400 rounded-lg transition-colors ${
              tx.isUpdated
                ? "opacity-50 cursor-not-allowed"
                : "hover:text-green-600 hover:bg-green-50"
            }`}
            onClick={() => !tx.isUpdated && onEdit(tx)}
            disabled={tx.isUpdated}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            className="p-1 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            onClick={() => onDelete(tx)}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, transactionId, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Xác nhận xóa giao dịch
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isDeleting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Bạn có chắc chắn muốn xóa giao dịch #{transactionId} không? Hành động này không thể hoàn tác.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            disabled={isDeleting}
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xóa...
              </>
            ) : (
              "Xóa"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Transactions Component
const Transactions = () => {
  const [list, setList] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [deletingTxId, setDeletingTxId] = useState(null);
  const [formData, setFormData] = useState({
    clientId: "",
    amount: "",
    status: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [error, setError] = useState(null);
  const itemsPerPage = 5;

  // Fetch data from API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("https://apitaskmanager.pdteam.net/api/admin", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const mappedData = data.payments.map((payment) => ({
          id: payment._id,
         clientId: payment.clientKeyId?._id ? `client-${payment.clientKeyId._id}` : "N/A",
          amount: payment.amount,
          status: payment.status,
          isUpdated: ["success", "failed"].includes(payment.status),
        }));
        setList(mappedData);
        setError(null);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách giao dịch:", err);
        setError("Không thể tải dữ liệu giao dịch. Vui lòng thử lại sau.");
      }
    };

    fetchTransactions();
  }, []);

  // Handlers
  const handleEdit = (tx) => {
    setEditingTx(tx);
    setFormData({
      clientId: tx.clientId,
      amount: tx.amount,
      status: tx.status,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (tx) => {
    setDeletingTxId(tx.id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `https://apitaskmanager.pdteam.net/api/admin/delete/${deletingTxId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Xóa giao dịch thất bại.");
      }

      setList(list.filter((tx) => tx.id !== deletingTxId));
      setIsDeleteModalOpen(false);
      setDeletingTxId(null);
      setError(null);
    } catch (err) {
      console.error("Lỗi khi xóa giao dịch:", err);
      setError(err.message || "Lỗi máy chủ khi xóa giao dịch.");
      setIsDeleteModalOpen(false);
      setDeletingTxId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDeletingTxId(null);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `https://apitaskmanager.pdteam.net/api/admin/payment/${editingTx.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: formData.status }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Cập nhật trạng thái thất bại.");
      }

      const data = await response.json();
      setList(
        list.map((tx) =>
          tx.id === editingTx.id
            ? { ...tx, status: data.status, isUpdated: true }
            : tx
        )
      );
      setIsModalOpen(false);
      setEditingTx(null);
      setFormData({ clientId: "", amount: "", status: "" });
      setError(null);
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingTx(null);
    setFormData({ clientId: "", amount: "", status: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Filter logic
  const filteredList = list?.filter((tx) => {
    const matchesSearch =
      tx.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toString().includes(searchTerm);
    const matchesStatus = filterStatus === "all" || tx.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = filteredList
    ? Math.ceil(filteredList.length / itemsPerPage)
    : 1;
  const paginatedList = filteredList?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getStatusCounts = () => {
    if (!list) return { all: 0, pending: 0, success: 0, failed: 0 };
    return list.reduce(
      (acc, tx) => {
        acc.all += 1;
        acc[tx.status] += 1;
        return acc;
      },
      { all: 0, pending: 0, success: 0, failed: 0 }
    );
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Danh sách giao dịch
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Quản lý và theo dõi các giao dịch của bạn
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Filter and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo Mã GD hoặc Client ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <div className="flex space-x-2">
            {["all", "pending", "success", "failed"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-colors ${
                  filterStatus === status
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {status === "all"
                  ? `Tất cả (${statusCounts.all})`
                  : status === "pending"
                  ? `Đang xử lý (${statusCounts.pending})`
                  : status === "success"
                  ? `Thành công (${statusCounts.success})`
                  : `Thất bại (${statusCounts.failed})`}
              </button>
            ))}
          </div>
        </div>

        {/* Modals */}
        <TransactionEditModal
          isOpen={isModalOpen}
          editingTx={editingTx}
          formData={formData}
          onInputChange={handleInputChange}
          onSave={handleSave}
          onCancel={handleCancel}
        />
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          transactionId={deletingTxId}
          isDeleting={isDeleting}
        />

        {/* Table */}
        {!list && !error ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mb-3" />
              <p className="text-gray-600 text-base sm:text-lg">
                Đang tải dữ liệu...
              </p>
            </div>
          </div>
        ) : error && !list ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              Lỗi tải dữ liệu
            </h3>
            <p className="text-gray-500 text-sm sm:text-base">{error}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Mobile View */}
            <div className="block lg:hidden">
              <div className="divide-y divide-gray-200">
                {paginatedList?.map((tx) => (
                  <div key={tx.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium text-gray-900 text-sm sm:text-base">
                        #{tx.id}
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                          tx.status === "success"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : tx.status === "failed"
                            ? "bg-red-100 text-red-800 border-red-200"
                            : "bg-yellow-100 text-yellow-800 border-yellow-200"
                        }`}
                      >
                        {tx.status === "success"
                          ? "Thành công"
                          : tx.status === "failed"
                          ? "Thất bại"
                          : "Đang xử lý"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm text-gray-500">
                        Client:
                      </span>
                      <span className="font-medium text-sm sm:text-base">
                        {tx.clientId}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs sm:text-sm text-gray-500">
                        Số tiền:
                      </span>
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(tx.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                      <button
                        className={`p-1 sm:p-2 text-gray-400 rounded-lg transition-colors ${
                          tx.isUpdated
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:text-green-600 hover:bg-green-50"
                        }`}
                        onClick={() => !tx.isUpdated && handleEdit(tx)}
                        disabled={tx.isUpdated}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={() => handleDeleteClick(tx)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-2 py-3 sm:px-4 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900">
                      Mã GD
                    </th>
                    <th className="px-2 py-3 sm:px-4 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-900">
                      Client
                    </th>
                    <th className="px-2 py-3 sm:px-4 sm:py-4 text-right text-xs sm:text-sm font-semibold text-gray-900">
                      Số tiền
                    </th>
                    <th className="px-2 py-3 sm:px-4 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-900">
                      Trạng thái
                    </th>
                    <th className="px-2 py-3 sm:px-4 sm:py-4 text-right text-xs sm:text-sm font-semibold text-gray-900">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedList?.map((tx) => (
                    <TransactionRow
                      key={tx.id}
                      tx={tx}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {paginatedList?.length === 0 && (
              <div className="p-10 sm:p-16 text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  Không tìm thấy giao dịch
                </h3>
                <p className="text-gray-500 text-sm sm:text-base">
                  Thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {filteredList && filteredList.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
            <div className="text-xs sm:text-sm text-gray-700">
              Hiển thị{" "}
              <span className="font-medium">{paginatedList.length}</span> trong{" "}
              <span className="font-medium">{filteredList.length}</span> kết quả
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={`px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
                      currentPage === page ? "bg-blue-600 text-white" : ""
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className="px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Transactions;