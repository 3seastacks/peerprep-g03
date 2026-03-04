const { createUser, getUserByUsername } = require("../models/userModel");
const { validateEmail, validatePassword, validateUsername } = require("../utils/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  const { username, password, email } = req.body;

  const emailcheck = validateEmail(email);
  const passwordcheck = validatePassword(password);
  const usernamecheck = validateUsername(username);
  if (emailcheck !== true) return res.status(400).json({ error: emailcheck });
  if (passwordcheck !== true) return res.status(400).json({ error: passwordcheck });
  if (usernamecheck !== true) return res.status(400).json({ error: usernamecheck });

  const existingUser = await getUserByUsername(username);
  if (existingUser) return res.status(409).json({ error: "Username already exists" });

  try {
    const user = await createUser(username, password, email, "user");
    res.status(201).json({ message: "User created", id: user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await getUserByUsername(username);
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    // give to frontend token + userid, username and role
    res.json({
      username: user.username,
      role: user.role,
      email: "",                     // blank to avoid frontend crash
      proficiency: user.proficiency || "",
      JWToken: token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};