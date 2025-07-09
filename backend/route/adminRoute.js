const express = require("express");
const router = express.Router();
const {
  login,
  updatePayment,
  showAll,
  findById,
  deletePayment,
} = require("../controller/admin");
const authenticateJWT = require("../middleware/authenticateJWT");
router.post("/login", login);

router.get("/profile", authenticateJWT, (req, res) => {
  res.json({ user: req.user });
});

router.put("/payment/:paymentId", authenticateJWT, updatePayment);

router.get("/", authenticateJWT, showAll);



router.delete("/delete/:paymentId", deletePayment);

module.exports = router;
