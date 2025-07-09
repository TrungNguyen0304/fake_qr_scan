import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import io from "socket.io-client";
import { FiClock, FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";

const PendingApproval = () => {
  const navigate = useNavigate();
  const { paymentId } = useParams();
  const [status, setStatus] = useState("loading");

  const SERVER_BASE = "http://192.168.1.17:8001";

  useEffect(() => {
    if (!paymentId) {
      console.error("❌ Thiếu paymentId trong URL!");
      return;
    }

    // ✅ Gọi API để đánh dấu "scanned"
    fetch(`${SERVER_BASE}/api/qrcode/scan/${paymentId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không thể đánh dấu scanned");
        return res.text();
      })
      .then((text) => {
        console.log("📥 Server scan response:", text);
      })
      .catch((err) => {
        console.error("❌ Scan API error:", err);
      });

    // ✅ Kết nối socket
    const socket = io(SERVER_BASE);
    console.log("📦 Theo dõi paymentId:", paymentId);
    socket.emit("join-payment-room", paymentId);

    socket.on("payment-status-updated", ({ status }) => {
      console.log("💡 Status updated:", status);
      if (status === "success") {
        setStatus("success");
      } else if (status === "failed") {
        setStatus("failed");
        localStorage.removeItem("clientId");
        setTimeout(() => navigate("/home/register"), 1000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [paymentId, navigate]);

  const renderStatusContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-lg">
                <FiClock className="text-4xl md:text-5xl text-blue-600 animate-pulse" />
              </div>
              <div className="absolute inset-0 w-24 h-24 md:w-32 md:h-32 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                Đang chờ xác nhận
              </h2>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed px-4">
                Giao dịch của bạn đã được gửi thành công. Quản trị viên đang xử
                lý yêu cầu của bạn.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mx-4">
              <div className="flex items-start space-x-3">
                <FiLoader className="text-blue-600 mt-1 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-800">
                    Thông tin giao dịch 
                  </p>
                  <p className="text-xs text-blue-600 mt-1">ID: {paymentId}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow-lg">
                <FiCheckCircle className="text-4xl md:text-5xl text-green-600" />
              </div>
              <div className="absolute inset-0 w-24 h-24 md:w-32 md:h-32 mx-auto border-4 border-green-200 rounded-full animate-ping opacity-75"></div>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold text-green-600">
                Giao dịch thành công!
              </h2>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mx-4">
              <p className="text-sm text-green-800">
                ✅ Giao dịch của bạn đã được xác nhận và hoàn tất
              </p>
            </div>
          </div>
        );

      case "failed":
        return (
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center shadow-lg">
                <FiXCircle className="text-4xl md:text-5xl text-red-600" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold text-red-600">
                Giao dịch thất bại
              </h2>
              <p className="text-gray-600 text-sm md:text-base">
                Đang chuyển hướng đến trang đăng ký...
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-4">
              <p className="text-sm text-red-800">
                ❌ Giao dịch không thể hoàn tất. Vui lòng thử lại sau.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h1 className="text-white text-lg md:text-xl font-semibold text-center">
              Trạng thái giao dịch
            </h1>
          </div>
          <div className="p-6 md:p-8">{renderStatusContent()}</div>
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Nếu có thắc mắc, vui lòng liên hệ bộ phận hỗ trợ
              <br />
              <a
                href="mailto:support@example.com"
                className="text-blue-600 hover:underline"
              >
                support@example.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;
