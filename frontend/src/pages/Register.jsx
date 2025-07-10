import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiCheckCircle, FiArrowLeft } from "react-icons/fi";

const Register = () => {
  const [callbackUrl, setCallbackUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic URL validation
    try {
      new URL(callbackUrl); // Validates URL format
    } catch {
      setError("Please enter a valid URL");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("https://apitaskmanager.pdteam.net/api/clients/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callbackUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to register client");
      }

      // Store client ID in localStorage
      localStorage.setItem("clientId", data.client.id);

      // Redirect to the intended page or default to /home/create-qr
      const redirectTo = location.state?.from?.pathname || "/home/create-qr";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-8 mt-12 animate-fade-in">
      <h1 className="text-2xl font-bold text-blue-600 mb-6 flex items-center gap-2">
        <FiCheckCircle /> Register Client
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="callbackUrl"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Callback URL
          </label>
          <input
            id="callbackUrl"
            type="url"
            required
            value={callbackUrl}
            onChange={(e) => setCallbackUrl(e.target.value)}
            placeholder="http://localhost:5173/home/create-qr"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          />
        </div>
        {error && (
          <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition duration-200"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </section>
  );
};

export default Register;