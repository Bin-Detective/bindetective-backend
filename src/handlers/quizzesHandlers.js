// quizzesHandlers.js

// Firestore database instance is initialized globally in app.js
const { v4: uuidv4 } = require("uuid");

// Handler to create a new quiz
// Request:
// {
//   "title": "General Knowledge Quiz",
//   "description": "A fun quiz to test your knowledge.",
//   "questions": [
//     {
//       "questionId": "q1",
//       "text": "What is the capital of France?",
//       "type": "multiple-choice",
//       "options": [
//         { "id": "o1", "text": "Paris", "isCorrect": true },
//         { "id": "o2", "text": "London", "isCorrect": false },
//         { "id": "o3", "text": "Berlin", "isCorrect": false },
//         { "id": "o4", "text": "Madrid", "isCorrect": false }
//       ]
//     }
//   ]
// }
// Response:
// {
//   "message": "Quiz created successfully",
//   "quizId": "generated-quiz-id"
// }
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, questions } = req.body; // Extract title, description, and questions from request body
    const quizId = uuidv4(); // Generate a unique ID for the quiz

    // Add new quiz document to 'quizzes' collection in Firestore
    await db.collection("quizzes").doc(quizId).set({
      title,
      description,
      questions,
      createdAt: new Date(), // Add a timestamp for when the quiz was created
    });

    res.status(201).send({ message: "Quiz created successfully", quizId }); // Send success response with quiz ID
  } catch (error) {
    console.error("Error creating quiz:", error); // Log error to console
    res.status(500).send("Internal Server Error"); // Send error response
  }
};

// Handler to fetch all quizzes
// Response:
// [
//   {
//     "quizId": "quiz1",
//     "title": "General Knowledge Quiz",
//     "description": "A fun quiz to test your knowledge."
//   },
//   {
//     "quizId": "quiz2",
//     "title": "Science Trivia",
//     "description": "Test your science knowledge!"
//   }
// ]
exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzesSnapshot = await db.collection("quizzes").get(); // Get all quiz documents from Firestore

    if (quizzesSnapshot.empty) {
      return res.status(404).send({ message: "No quizzes found" }); // Send 404 response if no quizzes are found
    }

    // Map each quiz document to an object containing quizId, title, and description
    const quizzes = quizzesSnapshot.docs.map((doc) => ({
      quizId: doc.id,
      title: doc.data().title,
      description: doc.data().description,
    }));

    res.status(200).send(quizzes); // Send array of quiz objects as response
  } catch (error) {
    console.error("Error fetching quizzes:", error); // Log error to console
    res.status(500).send("Internal Server Error"); // Send error response
  }
};

// Handler to fetch a specific quiz by ID
// Response:
// {
//   "title": "General Knowledge Quiz",
//   "description": "A fun quiz to test your knowledge.",
//   "questions": [
//     {
//       "questionId": "q1",
//       "text": "What is the capital of France?",
//       "type": "multiple-choice",
//       "options": [
//         { "id": "o1", "text": "Paris", "isCorrect": true },
//         { "id": "o2", "text": "London", "isCorrect": false },
//         { "id": "o3", "text": "Berlin", "isCorrect": false },
//         { "id": "o4", "text": "Madrid", "isCorrect": false }
//       ]
//     }
//   ]
// }
exports.getQuizById = async (req, res) => {
  try {
    const quizId = req.params.quizId; // Extract quiz ID from URL parameters
    const quizDoc = await db.collection("quizzes").doc(quizId).get(); // Get quiz document from Firestore

    if (!quizDoc.exists) {
      return res.status(404).send({ message: "Quiz not found" }); // Send 404 response if quiz is not found
    }

    res.status(200).send(quizDoc.data()); // Send quiz data as response
  } catch (error) {
    console.error("Error fetching quiz:", error); // Log error to console
    res.status(500).send("Internal Server Error"); // Send error response
  }
};

// Handler to submit quiz answers
// Request:
// {
//   "userId": "user123",
//   "answers": [
//     { "questionId": "q1", "selectedOptionId": "o1" },
//     { "questionId": "q2", "selectedOptionId": "o2" }
//   ]
// }
// Response:
// {
//   "message": "Quiz answers submitted successfully",
//   "score": 80
// }
exports.submitQuizAnswers = async (req, res) => {
  try {
    const quizId = req.params.quizId; // Extract quiz ID from URL parameters
    const { userId, answers } = req.body; // Extract user ID and answers from request body

    // Validate the answers and calculate the score (implementation depends on your quiz structure)
    const score = await calculateScore(answers, quizId);

    // Add the result to the 'results' collection in Firestore
    await db.collection("results").add({
      quizId,
      userId,
      answers,
      score,
      submittedAt: new Date(), // Add a timestamp for when the answers were submitted
    });

    res
      .status(200)
      .send({ message: "Quiz answers submitted successfully", score }); // Send success response with score
  } catch (error) {
    console.error("Error submitting quiz answers:", error); // Log error to console
    res.status(500).send("Internal Server Error"); // Send error response
  }
};

// Handler to fetch leaderboard for a quiz
// Response:
// [
//   { "userId": "user123", "score": 80, "completedAt": "2024-12-03T12:00:00Z" },
//   { "userId": "user456", "score": 70, "completedAt": "2024-12-02T15:30:00Z" }
// ]
exports.getQuizLeaderboard = async (req, res) => {
  try {
    const quizId = req.params.quizId; // Extract quiz ID from URL parameters
    const resultsSnapshot = await db
      .collection("results")
      .where("quizId", "==", quizId)
      .orderBy("score", "desc")
      .get(); // Get result documents for the quiz from Firestore, ordered by score

    if (resultsSnapshot.empty) {
      return res
        .status(404)
        .send({ message: "No results found for this quiz" }); // Send 404 response if no results are found
    }

    // Map each result document to an object containing userId, score, and completedAt
    const leaderboard = resultsSnapshot.docs.map((doc) => ({
      userId: doc.data().userId,
      score: doc.data().score,
      completedAt: doc.data().submittedAt,
    }));

    res.status(200).send(leaderboard); // Send array of leaderboard objects as response
  } catch (error) {
    console.error("Error fetching quiz leaderboard:", error); // Log error to console
    res.status(500).send("Internal Server Error"); // Send error response
  }
};

// Helper function to calculate the score (implementation depends on your quiz structure)
async function calculateScore(answers, quizId) {
  let score = 0;
  // Fetch the quiz questions from Firestore
  const quizDoc = await db.collection("quizzes").doc(quizId).get();
  const questions = quizDoc.data().questions;

  // Iterate over the answers and calculate the score
  answers.forEach((answer) => {
    const question = questions.find((q) => q.questionId === answer.questionId);
    if (question) {
      const correctOption = question.options.find((option) => option.isCorrect);
      if (correctOption && correctOption.id === answer.selectedOptionId) {
        score += 1; // Increment score for each correct answer
      }
    }
  });

  return score; // Return the calculated score
}
