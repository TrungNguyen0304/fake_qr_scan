const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendCallback } = require("../services/callbackService");
const Payment = require("../models/Payment");
const { getIO } = require("../socket/socketInstance"); // socket

const login = (req, res) => {
  const { email, password } = req.body;
  Admin.findOne({ email })
    .then((admin) => {
      if (!admin) {
        return res.status(400).json({ message: "Người dùng không tồn tại." });
      }
      return bcrypt.compare(password, admin.password).then((isMatch) => {
        if (!isMatch) {
          return res.status(400).json({ message: "Mật khẩu không đúng." });
        }
        const token = jwt.sign(
          { id: admin._id, name: admin.name, email: admin.email },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );
        res.json({ token });
      });
    })
    .catch((err) => {
      res.status(500).json({ message: "Lỗi máy chủ." });
    });
};

const updatePayment = (req, res) => {
  const { paymentId } = req.params;
  const { status } = req.body;
  const io = getIO(); //socket

  const allowedStatuses = ["success", "failed"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Trạng thái không hợp lệ." });
  }

  Payment.findById(paymentId)
    .then((payment) => {
      if (!payment) {
        return res.status(404).json({ message: "Không tìm thấy giao dịch." });
      }

      if (["success", "failed"].includes(payment.status)) {
        return res
          .status(400)
          .json({ message: "Giao dịch đã được xử lý trước đó." });
      }

      payment.status = status;

      return payment
        .save()
        .then(() => {
          io.to(payment._id.toString()).emit("payment-status-updated", {
            status: status,
          }); // socket

          return sendCallback(
            payment.clientKeyId,
            payment._id.toString(),
            status
          );
        })
        .then(() => {
          res.json({
            message: "Cập nhật trạng thái thành công.",
            status: status,
          });
        });
    })
    .catch((err) => {
      console.error("Lỗi cập nhật trạng thái:", err);
      res.status(500).json({ message: "Lỗi máy chủ khi cập nhật trạng thái." });
    });
};

const showAll = (req, res) => {
  Payment.find()
    .populate("clientKeyId", "callbackUrl")
    .sort({ createdAt: -1 })
    .then((payments) => {
      res.json({ count: payments.length, payments });
    })
    .catch((err) => {
      console.error("Lỗi khi lấy danh sách giao dịch:", err);
      res
        .status(500)
        .json({ message: "Lỗi máy chủ khi lấy danh sách giao dịch." });
    });
};

const deletePayment = (req, res) => {
  const { paymentId } = req.params;

  Payment.findByIdAndDelete(paymentId)
    .then((deletedPayment) => {
      if (!deletedPayment) {
        res.status(404).json({  
          message: "không tim thấy id giao dịch",
        });
      }
      res.json({ message: "Xóa giao dịch thành công.", deletedPayment });
    })
    .catch((err) => {
      console.error("Lỗi khi xóa giao dịch:", err);
      res.status(500).json({ message: "Lỗi máy chủ khi xóa giao dịch." });
    });
};

module.exports = { login, updatePayment, showAll, deletePayment };
