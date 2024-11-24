// predictRoutes.js

// Import necessary modules
const express = require("express");
const handlers = require("../handlers/predictHandlers.js");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });
const router = express.Router(); // Create router object to define root paths

// Apply the middleware to all routes
router.use(authenticateToken);

// Define routes and associate each route with its respective handlers.
router.post("/", upload.single("image"), handlers.handleImagePredict);

router.get("/collections", handlers.handleListCollection);

module.exports = router;