import React from "react";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

const Complete = () => {
  const navigate = useNavigate();
  const status = localStorage.getItem("finalStatus");
  const isSuccess = status === "success";

  const handleStartOver = () => {
    localStorage.removeItem("finalStatus");
    navigate("/home/create-qr");
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="flex justify-center mb-4">
          {isSuccess ? (
            <FiCheckCircle className="text-5xl text-green-600" />
          ) : (
            <FiXCircle className="text-5xl text-red-600" />
          )}
        </div>

        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {isSuccess ? "Hoàn tất!" : "Thất bại"}
        </h2>

        <p className="text-gray-600 mb-6">
          {isSuccess
            ? "Quy trình thanh toán của bạn đã hoàn tất."
            : "Rất tiếc, giao dịch của bạn không thành công."}
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleStartOver}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors duration-300"
          >
            Làm mới
          </button>
        </div>
      </div>
    </div>
  );
};

export default Complete;