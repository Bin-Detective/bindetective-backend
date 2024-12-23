// quizzesHandlers.js

// Firestore database instance is initialized globally in app.js
const { v4: uuidv4 } = require("uuid");
const { FieldValue } = require("firebase-admin/firestore"); // Import FieldValue from firebase-admin/firestore

// Handler to create a new quiz
exports.createQuiz = async (req, res) => {
  try {
    console.log("Creating a new quiz...");
    const { title, description, questions } = req.body; // Extract title, description, and questions from request body
    const quizId = uuidv4(); // Generate a unique ID for the quiz

    // Add new quiz document to 'quizzes' collection in Firestore
    await db.collection("quizzes").doc(quizId).set({
      title,
      description,
      questions,
      createdAt: new Date(), // Add a timestamp for when the quiz was created
    });

    console.log("Quiz created successfully with ID:", quizId);
    res.status(201).send({ message: "Quiz created successfully", quizId }); // Send success response with quiz ID
  } catch (error) {
    console.error("Error creating quiz:", error); // Log error to console
    res.status(500).send("Internal Server Error"); // Send error response
  }
};

// Handler to fetch all quizzes
exports.getAllQuizzes = async (req, res) => {
  try {
    console.log("Fetching all quizzes...");
    const quizzesSnapshot = await db.collection("quizzes").get(); // Get all quiz documents from Firestore

    if (quizzesSnapshot.empty) {
      console.log("No quizzes found");
      return res.status(404).send({ message: "No quizzes found" }); // Send 404 response if no quizzes are found
    }

    // Map each quiz document to an object containing quizId, title, and description
    const quizzes = quizzesSnapshot.docs.map((doc) => ({
      quizId: doc.id,
      title: doc.data().title,
      description: doc.data().description,
    }));

    console.log("Quizzes fetched successfully");
    res.status(200).send(quizzes); // Send array of quiz objects as response
  } catch (error) {
    console.error("Error fetching quizzes:", error); // Log error to console
    res.status(500).send("Internal Server Error"); // Send error response
  }
};

// Handler to fetch a specific quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    console.log("Fetching quiz by ID...");
    const quizId = req.params.quizId; // Extract quiz ID from URL parameters
    const quizDoc = await db.collection("quizzes").doc(quizId).get(); // Get quiz document from Firestore

    if (!quizDoc.exists) {
      console.log("Quiz not found with ID:", quizId);
      return res.status(404).send({ message: "Quiz not found" }); // Send 404 response if quiz is not found
    }

    console.log("Quiz fetched successfully with ID:", quizId);
    res.status(200).send(quizDoc.data()); // Send quiz data as response
  } catch (error) {
    console.error("Error fetching quiz:", error); // Log error to console
    res.status(500).send("Internal Server Error"); // Send error response
  }
};

// Handler to submit quiz answers
exports.submitQuizAnswers = async (req, res) => {
  try {
    console.log("Submitting quiz answers...");
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

    // Update the user's document to add the quiz history to the 'quizzesTaken' field
    const userRef = db.collection("users").doc(userId);
    await userRef.update({
      quizzesTaken: FieldValue.arrayUnion({
        quizId,
        score,
        completedAt: new Date(), // Add a timestamp for when the quiz was completed
      }),
    });

    console.log("Quiz answers submitted successfully for user:", userId);
    res
      .status(200)
      .send({ message: "Quiz answers submitted successfully", score }); // Send success response with score
  } catch (error) {
    console.error("Error submitting quiz answers:", error); // Log error to console
    res.status(500).send("Internal Server Error"); // Send error response
  }
};

// Helper function to calculate the score (implementation depends on your quiz structure)
async function calculateScore(answers, quizId) {
  let score = 0;
  console.log("Calculating score for quiz ID:", quizId);
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

  console.log("Score calculated:", score);
  return score; // Return the calculated score
}
