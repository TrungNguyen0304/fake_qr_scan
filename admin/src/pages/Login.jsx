import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Login = ({ setIsLoggedIn }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Define Yup validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Email không hợp lệ")
      .required("Vui lòng nhập email"),
    password: Yup.string()
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
      .required("Vui lòng nhập mật khẩu"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setError("");
      setLoading(true);
      try {
        const response = await axios.post(
          "https://apitaskmanager.pdteam.net/api/admin/login",
          values
        );

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("isLoggedIn", "true");
        setIsLoggedIn(true);
        navigate("/dashboard");
      } catch (err) {
        setError(
          err.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại."
        );
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-sky-100 via-blue-200 to-indigo-100 p-4 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md transition-all duration-300 animate-fade-in">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6 tracking-wide">
          Đăng nhập Admin
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 text-sm text-center px-4 py-2 rounded-lg mb-4 border border-red-200">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={formik.handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                formik.touched.email && formik.errors.email
                  ? "border-red-500"
                  : ""
              }`}
              placeholder="admin@example.com"
              required
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-600 text-xs mt-1">
                {formik.errors.email}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full border border-gray-300 rounded-xl px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-500"
                    : ""
                }`}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
                tabIndex={-1}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-600 text-xs mt-1">
                {formik.errors.password}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-xl font-semibold text-white text-base tracking-wide shadow-sm transition-all duration-300 ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-indigo-500 hover:to-blue-600"
            }`}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-6">
          © 2025 Fake QR Admin. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
