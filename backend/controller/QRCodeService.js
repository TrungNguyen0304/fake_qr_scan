const Client = require("../models/Client");
const Payment = require("../models/Payment");
const QRCode = require("qrcode");

const generateQRCode = (req, res) => {
  const { amount } = req.body;
  const { clientKeyId } = req.params;

  if (typeof amount !== "number" || amount < 0) {
    return res.status(400).json({ message: "Số tiền không hợp lệ" });
  }

  Client.findById(clientKeyId)
    .then((client) => {
      if (!client) {
        return res.status(404).json({ message: "Client ID không tồn tại" });
      }

      return Payment.create({
        clientKeyId,
        amount,
        status: "pending",
      }).then((payment) => {
        const serverURL = "http://192.168.1.17:5173";
        const qrURL = `${serverURL}/home/pending-approval/${payment._id}`;
        console.log(qrURL);

        return QRCode.toDataURL(qrURL).then((qrCodeImage) => {
          res.json({
            paymentId: payment._id,
            qrCode: qrCodeImage,
            status: payment.status,
            url: qrURL,
          });
        });
      });
    })
    .catch((error) => {
      console.error("QR code error:", error);
      res.status(500).json({ message: "Lỗi tạo QR code." });
    });
};

const scanQRCode = (req, res) => {
  const { paymentId } = req.params;

  Payment.findById(paymentId)
    .then((payment) => {
      if (!payment) {
        return res.status(404).send("Payment not found");
      }

      // Nếu giao dịch đã xử lý xong
      if (payment.status === "success") {
        return res.send("giao dịch thành công");
      }
      if (payment.status === "failed") {
        return res.send("giao dịch thất bại");
      }

      // Kiểm tra hết hạn (15 phút)
      const createdAt = new Date(payment.createdAt);
      const now = new Date();
      const diffMinutes = (now - createdAt) / 60000;
      if (diffMinutes > 15) {
        return res.status(410).send("Payment expired");
      }

      // Nếu còn pending → chuyển sang scanned
      if (payment.status === "pending") {
        payment.status = "scanned";
        return payment.save().then(() => {
          res.send("Vui lòng chờ admin xử lý giao dịch...");
        });
      }

      // Nếu không vào các case trên, vẫn trả trang chờ
      res.send("Vui lòng chờ admin xử lý giao dịch...");
    })
    .catch((err) => {
      console.error("QR Scan Error:", err);
      res.status(500).send("Lỗi hệ thống");
    });
};

module.exports = { generateQRCode, scanQRCode };
