const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");

const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ✅ Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    const newUser = new User({ name, email, password, role });
    await newUser.save();

    res.status(201).json({ msg: "User created successfully ✅" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // token generate
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      msg: "Login successful ✅",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// 🔹 Protected Dashboard (any logged-in user)
router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({
    msg: "Welcome to your dashboard 🎉",
    user: req.user
  });
});

// 🔹 Role-Based Routes

// Student dashboard
router.get(
  "/student-dashboard",
  authMiddleware,
  authorizeRoles("student"),
  (req, res) => {
    res.json({ msg: "Welcome Student! 🎓" });
  }
);

// Faculty dashboard
router.get(
  "/faculty-dashboard",
  authMiddleware,
  authorizeRoles("faculty"),
  (req, res) => {
    res.json({ msg: "Welcome Faculty! 🧑‍🏫" });
  }
);

// Admin dashboard
router.get(
  "/admin-dashboard",
  authMiddleware,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({ msg: "Welcome Admin! 🛡️" });
  }
);

module.exports = router;
