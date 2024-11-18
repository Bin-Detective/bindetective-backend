// app.js

// Import necessary modules
const express = require("express"); // Express framework for building web applications
const bodyParser = require("body-parser"); // Middleware to parse incoming request bodies
const authRoutes = require("./routers/authRoutes"); // Custom routes for handling user-related requests
const contentRoutes = require("./routers/contentRoutes"); // Custom routes for handling content-related requests

// Load environment variables from .env file
const path = require("path");
require("dotenv").config();

// Firebase Admin SDK initialization
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

// Set the port where the app will run
const PORT = process.env.PORT || 7070;

// Use a hard-coded flag to toggle emulator
const USE_FIRESTORE_EMULATOR = false; // Set to `false` for deployment
const USE_AUTH_EMULATOR = false; // Set to `false` for deployment

if (!USE_FIRESTORE_EMULATOR) {
  // Initialize Firebase app with service account credentials from cloud run
  initializeApp();
} else {
  // Firebase service account credentials
  const serviceAccountPath = process.env.SERVICE_ACCOUNT_PATH;
  const serviceAccount = require(serviceAccountPath);
  // Initialize Firebase app with service account credentials
  console.log("Using Provided Credentials...");
  initializeApp({
    credential: cert(serviceAccount),
  });
}

// Set Firestore instance as a global variable
global.db = getFirestore();

if (USE_FIRESTORE_EMULATOR) {
  console.log("Using Firestore emulator...");
  db.settings({
    host: "localhost:8080", // Firestore emulator host
    ssl: false, // Disable SSL for the emulator connection
  });
}

if (USE_AUTH_EMULATOR) {
  console.log("Using Auth emulator...");
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099"; // Auth emulator host
}

const app = express(); // Initialize Express app

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Register user-related routes with '/users' prefix
app.use("/users", authRoutes);

// Register content related routes with '/content' prefix
app.use("/articles", contentRoutes);

// Start the Express server and listen for incoming requests on specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
