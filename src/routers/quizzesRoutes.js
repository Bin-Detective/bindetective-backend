// quizzesRoutes.js

// Import necessary modules
const express = require("express");
const handlers = require("../handlers/quizzesHandlers"); // Import handler functions from handlers.js
const { authenticateToken } = require("../middleware/authenticateToken"); // Import the authentication middleware

const router = express.Router(); // Create a new router object to define route paths

// Apply the middleware to all routes
// router.use(authenticateToken);

// Define routes and associate each route with its respective handlers

/* Create a new quiz
Reeust :
{
  "title": "General Knowledge Quiz",
  "description": "A fun quiz to test your knowledge.",
  "questions": [
    {
      "questionId": "q1",
      "text": "What is the capital of France?",
      "type": "multiple-choice",
      "options": [
        { "id": "o1", "text": "Paris", "isCorrect": true },
        { "id": "o2", "text": "London", "isCorrect": false },
        { "id": "o3", "text": "Berlin", "isCorrect": false },
        { "id": "o4", "text": "Madrid", "isCorrect": false }
      ]
    }
  ]
}
*/
router.post("/", handlers.createQuiz);

/* Fetch all quizzes
Response :
[
  {
    "quizId": "quiz1",
    "title": "General Knowledge Quiz",
    "description": "A fun quiz to test your knowledge."
  },
  {
    "quizId": "quiz2",
    "title": "Science Trivia",
    "description": "Test your science knowledge!"
  }
]
*/
router.get("/", handlers.getAllQuizzes);

/* Fetch a specific quiz
Response
{
  "title": "General Knowledge Quiz",
  "description": "A fun quiz to test your knowledge.",
  "questions": [
    {
      "questionId": "q1",
      "text": "What is the capital of France?",
      "type": "multiple-choice",
      "options": [
        { "id": "o1", "text": "Paris", "isCorrect": true },
        { "id": "o2", "text": "London", "isCorrect": false },
        { "id": "o3", "text": "Berlin", "isCorrect": false },
        { "id": "o4", "text": "Madrid", "isCorrect": false }
      ]
    }
  ]
}
*/
router.get("/:quizId", handlers.getQuizById);

/* Submit quiz answers
Request :
{
  "userId": "user123",
  "answers": [
    { "questionId": "q1", "selectedOptionId": "o1" },
    { "questionId": "q2", "selectedOptionId": "o2" }
  ]
}
*/
router.post("/:quizId/submit", handlers.submitQuizAnswers);

// Export the router object so it can be used in app.js
module.exports = router;
