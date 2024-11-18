// contentRoutes.js

// Import necessary modules
const express = require("express");
const handlers = require("../handlers/contentHandlers.js");

const router = express.Router(); // Create router object to define root paths

// Define routes and associate each route with it's respective handlers.

// Route to create a new article
// POST /articles - Body: { "title": "string", "author": "string", "dateAdded": "string", "description": "string", "content": "string" }
router.post("/", handlers.createArticle);

// Route to get an article by ID
// GET /articles/:contentId - :contentId is a URL parameter for the unique article ID
router.get("/:contentId", handlers.getArticleById);

// Route to update an existing article by ID
// PUT /articles/:contentId - Body: { "title": "string", "author": "string", "dateAdded": "string", "description": "string", "content": "string" }
router.put("/:contentId", handlers.updateArticleById);

// Route to delete an article by ID
// DELETE /articles/:contentId - Deletes the article with specified ID from the database
router.delete("/:contentId", handlers.deleteArticleById);

// Route to get all articles
// GET /articles - Retrieves a list of all articles in the database
router.get("/", handlers.getAllArticles);

module.exports = router;
