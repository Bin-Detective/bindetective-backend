// app.js

// Import necessary modules
const express = require("express"); // Express framework for building web applications
const bodyParser = require("body-parser"); // Middleware to parse incoming request bodies
const authRoutes = require("./routers/authRoutes"); // Custom routes for handling user-related requests
const contentRoutes = require("./routers/contentRoutes"); // Custom routes for handling content-related requests
const predictRoutes = require("./routers/predictRoutes"); // Routes for handling the predict request to robin
const quizzesRoutes = require("./routers/quizzesRoutes"); // Routes for handling the quiz questions
const cron = require("node-cron"); // Package for scheduling tasks
const fs = require("fs");
const dotenv = require("dotenv");

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

// Firebase storage bucket name
const bucketPath = process.env.FIREBASE_STORAGE_BUCKET;

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Function to clean the uploads directory
const cleanUploadsDir = () => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(uploadsDir, file), (err) => {
        if (err) throw err;
      });
    }
    console.log("Uploads directory cleaned.");
  });
};

// Initialize Firebase app with service account credentials
if (!IS_ON_DEV) {
  console.log("Using Service Account Credentials");
  initializeApp({
    storageBucket: bucketPath,
  });

  // Set Firestore and Storage instances as global variables
  global.db = getFirestore();
  global.bucket = getStorage().bucket();
} else {
  const serviceAccountPath = process.env.SERVICE_ACCOUNT_PATH;
  const serviceAccount = require(serviceAccountPath);
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
  global.db.settings({
    host: "localhost:8089", // Firestore emulator host
    ssl: false,
  });

  // Setup Auth emulator config
  console.log("Using Auth emulator...");
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099"; // Auth emulator host
}

// Initialize Express app
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Use custom routes
app.use("/users", authRoutes);
app.use("/articles", contentRoutes);
app.use("/predict", predictRoutes);
app.use("/quizzes", quizzesRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
