// createAdmin.js
//
// This script interactively creates an admin user in your MongoDB database.
// It will ask for username, password, and contact info via the terminal.
// If an admin already exists, it will abort to prevent accidental privilege duplication.
//
// 📌 Requirements:
// - .env file with MONGO_URI
// - MongoDB models and connection properly configured
//
// ▶️ Usage:
// node createAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const readline = require('readline');
const User = require('./models/User');

// Create a terminal input interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Wrap question prompt as a promise for async/await usage
function ask(question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer)));
}

async function createAdmin() {
  try {
    // Step 1: Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 🚫 Step 2: Check if ANY admin already exists
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (existingAdmin) {
      console.log(`⚠️ Admin account already exists (username: ${existingAdmin.username}).`);
      console.log("🚫 Aborting to prevent multiple default admins.");
      return rl.close();
    }

    // Step 3: Gather input from the user
    const username = await ask("Enter admin username: ");
    const contact = await ask("Enter contact info (email or phone): ");
    const rawPassword = await ask("Enter password: ");

    // Step 4: Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log("⚠️ A user with that username already exists. Aborting.");
      return rl.close();
    }

    // Step 5: Securely hash the password
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Step 6: Create and save the new admin user
    const user = new User({
      username,
      password: hashedPassword,
      contact,
      isAdmin: true
    });

    await user.save();
    console.log("✅ Admin user created successfully!");

  } catch (err) {
    console.error("❌ Error creating admin user:", err);
  } finally {
    // Step 7: Close resources
    rl.close();
    mongoose.connection.close();
  }
}

createAdmin();
