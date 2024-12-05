// predictRoutes.js

// Import necessary modules
const express = require("express");
const handlers = require("../handlers/predictHandlers.js");
const multer = require("multer");
const path = require("path");
const { authenticateToken } = require("../middleware/authenticateToken"); // Import the authentication middleware

// Configure multer to save files to the 'uploads' directory with the original file extension
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage: storage });

const router = express.Router(); // Create router object to define root paths

// Apply the middleware to all routes
// router.use(authenticateToken);

// Define routes and associate each route with its respective handlers.
router.post("/", upload.single("image"), handlers.handleImagePredict);

router.get("/collections", handlers.getAllPredictHistory);

module.exports = router;
