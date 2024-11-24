// predictRoutes.js

// Import necessary modules
const express = require("express");
const handlers = require("../handlers/predictHandlers.js");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });
const router = express.Router(); // Create router object to define root paths

// Define routes and associate each route with it's respective handlers.
router.post("/upload", upload.single("image"), handlers.handleImagePredict);

module.exports = router;
