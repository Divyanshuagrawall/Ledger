const express = require("express");
const router = express.Router();

const {Register, Login, userLogoutcontroller} = require("../controllers/auth.controller");
router.post("/register", Register);
router.post("/login", Login);
router.post("/logout", userLogoutcontroller)

module.exports = router;