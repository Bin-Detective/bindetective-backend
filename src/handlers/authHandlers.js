// handlers.js

// Firestore database instance is initialized globally in app.js
const { FieldValue } = require("firebase-admin/firestore"); // Import FieldValue from firebase-admin/firestore

// Handler to create a new user
// Expected request body: { "userName": "string", "dateOfBirth": "string", "profilePictureUrl": "string" }
exports.createUser = async (req, res) => {
  try {
    console.log("Creating a new user...");
    const { userName, dateOfBirth, profilePictureUrl } = req.body;
    const userId = req.uid; // Use the UID from the authenticated request

    // Validate required fields
    if (!userName) {
      console.log("userName is required");
      return res.status(400).send("userName is required");
    }

    // Add new user document to 'users' collection in Firestore
    await db
      .collection("users")
      .doc(userId)
      .set({
        userName,
        dateOfBirth,
        profilePictureUrl: profilePictureUrl || null, // Include profile picture URL if provided
        predictCollection: [],
        quizzesTaken: [], // Initialize quizzesTaken as an empty array
      });

    console.log("User created successfully:", userId);
    res.status(201).send({ message: "User created successfully" }); // Send success response
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send("Internal Server Error"); // Send error response if any issues occur
  }
};

// Handler to get a user by ID
// URL parameter: :userId - ID of the user to retrieve
exports.getUserById = async (req, res) => {
  try {
    console.log("Fetching user by ID...");
    const userId = req.params.userId; // Extract user ID from URL
    const userDoc = await db.collection("users").doc(userId).get(); // Get user document from Firestore

    // Check if user exists
    if (!userDoc.exists) {
      console.log("User not found:", userId);
      return res.status(404).send("User not found");
    }

    console.log("User fetched successfully:", userId);
    res.status(200).send(userDoc.data()); // Send user data in response
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Handler to update a user by ID
// URL parameter: :userId - ID of the user to update
// Expected request body: { "userName": "string", "dateOfBirth": "string", "profilePictureUrl": "string" }
exports.updateUserById = async (req, res) => {
  try {
    console.log("Updating user by ID...");
    const userId = req.params.userId; // Extract user ID from URL
    const { userName, dateOfBirth, profilePictureUrl } = req.body; // Extract fields to update from request body

    // Update specified fields in the user document
    await db
      .collection("users")
      .doc(userId)
      .update({
        ...(userName && { userName }), // Only update if userName is provided
        ...(dateOfBirth && { dateOfBirth }), // Only update if dateOfBirth is provided
        ...(profilePictureUrl && { profilePictureUrl }), // Only update if profilePictureUrl is provided
      });

    console.log("User updated successfully:", userId);
    res.status(200).send({ message: "User updated successfully" }); // Send success response
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Handler to delete a user by ID
// URL parameter: :userId - ID of the user to delete
exports.deleteUserById = async (req, res) => {
  try {
    console.log("Deleting user by ID...");
    const userId = req.params.userId; // Extract user ID from URL
    await db.collection("users").doc(userId).delete(); // Delete user document from Firestore

    console.log("User deleted successfully:", userId);
    res.status(200).send({ message: "User deleted successfully" }); // Send success response
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Handler to get all users
exports.getAllUsers = async (req, res) => {
  try {
    console.log("Fetching all users...");
    const usersSnapshot = await db.collection("users").get(); // Get all user documents from Firestore

    // Check if there are no users
    if (usersSnapshot.empty) {
      console.log("No users found");
      return res.status(404).send({ message: "No users found" });
    }

    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      profilePictureUrl: doc.data().profilePictureUrl || null, // Include profile picture URL if available
    })); // Format each document to include ID and profile picture URL

    console.log("Users fetched successfully");
    res.status(200).send(users); // Send array of user objects as response
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Handler to get user's predictCollection items
// URL parameter: :userId - ID of the user to retrieve predictCollection items for
exports.getUserPredictCollection = async (req, res) => {
  try {
    console.log("Fetching user's predictCollection items...");
    const userId = req.params.userId; // Extract user ID from URL
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      console.log("User not found:", userId);
      return res.status(404).send({ message: "User not found" });
    }

    const userData = userDoc.data();
    const predictCollection = userData.predictCollection || [];

    // Fetch the corresponding items from the 'predict_history' collection
    const predictHistoryPromises = predictCollection.map((id) =>
      db.collection("predict_history").doc(id).get()
    );
    const predictHistoryDocs = await Promise.all(predictHistoryPromises);

    const predictHistoryItems = predictHistoryDocs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(
      "PredictCollection items fetched successfully for user:",
      userId
    );
    res.status(200).send({ predictHistoryItems });
  } catch (error) {
    console.error("Error getting user's predictCollection items:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// Handler to get a user's results
// URL parameter: :userId - ID of the user to retrieve results for
// Response:
// [
//   {
//     "quizId": "quiz1",
//     "score": 80,
//     "completedAt": "2024-12-03T12:00:00Z"
//   }
// ]
exports.getUserResults = async (req, res) => {
  try {
    console.log("Fetching user's results...");
    const userId = req.params.userId; // Extract user ID from URL parameters
    const userDoc = await db.collection("users").doc(userId).get(); // Get user document from Firestore

    if (!userDoc.exists) {
      console.log("User not found:", userId);
      return res.status(404).send({ message: "User not found" }); // Send 404 response if user is not found
    }

    const userData = userDoc.data();
    const quizzesTaken = userData.quizzesTaken || []; // Get quizzesTaken field from user document

    console.log("User results fetched successfully for user:", userId);
    res.status(200).send(quizzesTaken); // Send array of quizzesTaken objects as response
  } catch (error) {
    console.error("Error fetching user results:", error); // Log error to console
    res.status(500).send("Internal Server Error"); // Send error response
  }
};
