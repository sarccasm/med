
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Email та пароль (мін. 6 символів) обов'язкові" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Користувач з таким email вже існує" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ email, passwordHash });

    const secret = process.env.JWT_SECRET || "devsecret";
    const token = jwt.sign({ id: user._id, email: user.email }, secret, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Введи email та пароль" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Невірні дані для входу" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Невірні дані для входу" });
    }

    const secret = process.env.JWT_SECRET || "devsecret";
    const token = jwt.sign({ id: user._id, email: user.email }, secret, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
