const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Initialize Pool with the connection string
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const EMAIL_PEPPER = process.env.EMAIL_PEPPER;
const BCRYPT_SALT_ROUNDS = 12;

function hashEmail(email) {
  return crypto.createHmac("sha256", EMAIL_PEPPER).update(email.toLowerCase()).digest("hex");
}

// Create a user and store in the database
async function createUser(username, password, email, role = "User") {
  const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  const hashedEmail = hashEmail(email);
  const usernameLower = username.toLowerCase();

  const res = await pool.query(
    "INSERT INTO users(username, password, email, role) VALUES($1, $2, $3, $4) RETURNING *",
    [usernameLower, hashedPassword, hashedEmail, role]
  );
  return res.rows[0];
}

// Retrieve a user by their username
async function getUserByUsername(username) {
  const res = await pool.query(
    "SELECT * FROM users WHERE LOWER(username) = LOWER($1)",
    [username]
  );
  return res.rows[0];
}

module.exports = { createUser, getUserByUsername };