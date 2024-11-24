// app.js

// Import necessary modules
const express = require("express"); // Express framework for building web applications
const bodyParser = require("body-parser"); // Middleware to parse incoming request bodies
const authRoutes = require("./routers/authRoutes"); // Custom routes for handling user-related requests
const contentRoutes = require("./routers/contentRoutes"); // Custom routes for handling content-related requests
const predictRoutes = require("./routers/predictRoutes"); // Routes for handling the predict request to robin

// Load environment variables from .env file
const path = require("path");
require("dotenv").config();

// Firebase Admin SDK initialization
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { getStorage } = require("firebase-admin/storage");

// Set the port where the app will run
const PORT = process.env.PORT || 7070;

// Use environment variables to toggle emulator
const IS_ON_DEV = process.env.IS_ON_DEV === "true";

const bucketPath = process.env.FIREBASE_STORAGE_BUCKET;

if (!IS_ON_DEV) {
  // Initialize Firebase app with service account credentials for production
  const serviceAccountPath = process.env.SERVICE_ACCOUNT_PATH;
  const serviceAccount = require(serviceAccountPath);
  console.log("Using default credentials");
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: bucketPath,
  });

  // Set Firestore and Storage instances as global variables
  global.db = getFirestore();
  global.bucket = getStorage().bucket();
} else {
  // Firebase service account credentials
  const serviceAccountPath = process.env.SERVICE_ACCOUNT_PATH;
  const serviceAccount = require(serviceAccountPath);
  // Initialize Firebase app with service account
  console.log("Using Provided Credentials...");
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: bucketPath,
  });

  // Set Firestore and Storage instances as global variables
  global.db = getFirestore();
  global.bucket = getStorage().bucket();

  // Setup Firestore Emulator Config
  console.log("Using Firestore emulator...");
  db.settings({
    host: "localhost:8089", // Firestore emulator host
    ssl: false, // Disable SSL for the emulator connection
  });

  // Setup Auth emulator config
  console.log("Using Auth emulator...");
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099"; // Auth emulator host
}

// Initialize Firebase Storage
const storage = getStorage();
global.bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);

const app = express(); // Initialize Express app

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Register user-related routes with '/users' prefix
app.use("/users", authRoutes);

// Register content related routes with '/content' prefix
app.use("/articles", contentRoutes);

// Register image prediction route with '/predict' prefix
app.use("/predict", predictRoutes);

// Start the Express server and listen for incoming requedsts on specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
