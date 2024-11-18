// authRoutes.js

// Import necessary modules
const express = require("express");
const handlers = require("../handlers/authHandlers"); // Import handler functions from handlers.js
const { authenticateToken } = require("../middleware/authenticateToken"); // Import the authentication middleware

const router = express.Router(); // Create a new router object to define route paths

// Apply the middleware to all routes
router.use(authenticateToken);

// Define routes and associate each route with a handler function in handlers.js

// Route to create a new user in the database
// POST /users - Body: { "userName": "string", "dateOfBirth": "string" }
router.post("/", handlers.createUser);

// Route to get a user by ID
// GET /users/:userId - :userId is a URL parameter for the unique user ID
router.get("/:userId", handlers.getUserById);

// Route to update an existing user by ID
// PUT /users/:userId - Body: { "userName": "string", "dateOfBirth": "string" }
router.put("/:userId", handlers.updateUserById);

// Route to delete a user by ID
// DELETE /users/:userId - Deletes the user with specified ID from the database
router.delete("/:userId", handlers.deleteUserById);

// Route to get all users
// GET /users - Retrieves a list of all users in the database
router.get("/", handlers.getAllUsers);

// Export the router object so it can be used in app.js
module.exports = router;
