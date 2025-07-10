import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';

const QrScan = () => {
  const navigate = useNavigate();
  const { paymentId } = useParams();

  useEffect(() => {
    // Initialize Socket.IO connection
    const socket = io('https://apitaskmanager.pdteam.net');

    console.log('📦 QR Scanned for paymentId:', paymentId);
    socket.emit('join-payment-room', paymentId);

    // Simulate QR scan completion and notify backend (replace with actual scan logic if needed)
    socket.emit('qr-scanned', { paymentId });

    // Redirect to pending-approval with paymentId
    navigate(`/home/pending-approval/${paymentId}`);

    // Cleanup socket connection
    return () => {
      socket.disconnect();
    };
  }, [paymentId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800">Đang xử lý quét QR...</h2>
        <div className="w-16 h-16 border-8 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto mt-4"></div>
      </div>
    </div>
  );
};

export default QrScan;