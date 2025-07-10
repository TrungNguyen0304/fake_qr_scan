import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { GrLinkPrevious } from "react-icons/gr";
import { FiDownload } from "react-icons/fi";

const CreateQr = () => {
  const [loading, setLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const navigate = useNavigate();
  const SERVER_BASE = "https://apitaskmanager.pdteam.net";

  const validationSchema = Yup.object({
    amount: Yup.string()
      .required("Vui lòng nhập số tiền")
      .test("min-amount", "Số tiền tối thiểu là 1.000", (value) => {
        const raw = value?.replace(/\D/g, "") || "0";
        return parseInt(raw, 10) >= 1000;
      }),
  });

  const handleCreate = async (values, { setErrors }) => {
    const numericAmount = parseInt(values.amount.replace(/\D/g, ""), 10);
    const clientId = localStorage.getItem("clientId");

    if (!clientId) {
      setErrors({ amount: "Thiếu clientId! Vui lòng đăng ký trước." });
      return;
    }

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrors({ amount: "Vui lòng nhập số tiền hợp lệ." });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${SERVER_BASE}/api/qrcode/generate/${clientId}`,
        { amount: numericAmount }
      );

      const data = response.data;
      const paymentInfo = {
        id: data.paymentId,
        amount: numericAmount,
        clientId,
        status: data.status,
      };

      setQrUrl(data.qrCode);
      setPaymentInfo(paymentInfo);

      // Kết nối socket để theo dõi trạng thái thanh toán
      const socket = io(SERVER_BASE);
      socket.emit("join-payment-room", data.paymentId);

      socket.on("payment-status-updated", ({ status }) => {
        console.log("💡 Status from server (CreateQr):", status);
        localStorage.setItem("finalStatus", status);
        localStorage.setItem("clientId", clientId);
        navigate("/home/complete");
        socket.disconnect();
      });
    } catch (err) {
      console.error("❌ Lỗi tạo mã QR:", err);
      setErrors({
        amount: err.response?.data?.message || "Đã xảy ra lỗi khi tạo mã QR.",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value) => {
    const numeric = value.replace(/\D/g, "");
    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleBack = () => {
    navigate("/home/register");
  };

  const handleDownload = () => {
    if (!qrUrl) return;

    const downloadLink = document.createElement("a");
    downloadLink.href = qrUrl;
    downloadLink.download = "payment-qr.png";
    downloadLink.click();
  };

  const InfoItem = ({ label, value, full }) => (
    <div className={full ? "col-span-full" : ""}>
      <span className="font-medium text-gray-600 mr-1">{label}:</span>
      <span className="text-gray-800 break-all">{value}</span>
    </div>
  );

  return (
    <section className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 animate-fade-in">
      <div
        className="flex items-center gap-2 mb-6 text-blue-600 cursor-pointer hover:underline text-lg font-medium"
        onClick={handleBack}
      >
        <GrLinkPrevious />
        Quay lại
      </div>

      <header className="flex items-center gap-3 mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-blue-700">
          Tạo mã QR thanh toán
        </h1>
      </header>

      <Formik
        initialValues={{ amount: "" }}
        validationSchema={validationSchema}
        onSubmit={handleCreate}
      >
        {({ values, setFieldValue }) => (
          <Form className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">
                Số tiền (VND)
              </label>
              <Field name="amount">
                {({ field }) => (
                  <input
                    {...field}
                    type="text"
                    inputMode="numeric"
                    value={values.amount}
                    onChange={(e) =>
                      setFieldValue("amount", formatNumber(e.target.value))
                    }
                    placeholder="100.000"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Số tiền (VND)"
                  />
                )}
              </Field>
              <ErrorMessage
                name="amount"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              aria-label={loading ? "Đang tạo mã QR" : "Tạo mã QR"}
            >
              {loading ? "Đang tạo..." : "Tạo mã QR"}
            </button>
          </Form>
        )}
      </Formik>

      {qrUrl && (
        <div className="text-center mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Mã QR thanh toán
          </h3>
          <div className="inline-block border-4 border-blue-100 rounded-xl bg-white">
            <img
              src={qrUrl}
              alt="Mã QR thanh toán"
              className="w-64 h-64 object-contain"
            />
          </div>
          <p className="mt-3 text-xs text-gray-500 break-all max-w-xs mx-auto">
            Quét mã này để thanh toán
          </p>
          <button
            onClick={handleDownload}
            className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-full font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
            aria-label="Tải mã QR"
          >
            <FiDownload className="text-lg" />
            Tải QR
          </button>
        </div>
      )}

      {paymentInfo && (
        <div className="mt-10 border-t pt-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Thông tin thanh toán
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm bg-gray-50 p-4 rounded-xl shadow-inner">
            <InfoItem label="Mã đơn hàng" value={paymentInfo.id} />
            <InfoItem
              label="Số tiền"
              value={`${parseInt(paymentInfo.amount).toLocaleString(
                "vi-VN"
              )} VNĐ`}
            />
            <InfoItem label="Client ID" value={paymentInfo.clientId} />
            <InfoItem label="Trạng thái" value={paymentInfo.status} />
          </div>
        </div>
      )}
    </section>
  );
};

export default CreateQr;
