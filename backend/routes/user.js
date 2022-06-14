const express = require("express");
const {
  registerUser,
  activateAccount,
  loginUser,
} = require("../controllers/user");

const router = express.Router();

router.post("/register", registerUser);
router.post("/activate", activateAccount);
router.post("/login", loginUser);

module.exports = router;
