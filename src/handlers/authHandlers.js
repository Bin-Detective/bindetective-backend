// handlers.js

// Firestore database instance is initialized globally in app.js

// Handler to create a new user
// Expected request body: { "userId": "string", "userName": "string", "dateOfBirth": "string" }
// Handler to create a new user
// Expected request body: { "userName": "string", "dateOfBirth": "string" }

exports.createUser = async (req, res) => {
  try {
    const { userName, dateOfBirth } = req.body;
    const userId = req.uid; // Use the UID from the authenticated request

    // Validate required fields
    if (!userName) {
      return res.status(400).send("userName is required");
    }

    // Add new user document to 'users' collection in Firestore
    await db.collection("users").doc(userId).set({
      userName,
      dateOfBirth,
    });

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
    const userId = req.params.userId; // Extract user ID from URL
    const userDoc = await db.collection("users").doc(userId).get(); // Get user document from Firestore

    // Check if user exists
    if (!userDoc.exists) {
      return res.status(404).send("User not found");
    }

    res.status(200).send(userDoc.data()); // Send user data in response
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Handler to update a user by ID
// URL parameter: :userId - ID of the user to update
// Expected request body: { "userName": "string", "dateOfBirth": "string" }
exports.updateUserById = async (req, res) => {
  try {
    const userId = req.params.userId; // Extract user ID from URL
    const { userName, dateOfBirth } = req.body; // Extract fields to update from request body

    // Update specified fields in the user document
    await db
      .collection("users")
      .doc(userId)
      .update({
        ...(userName && { userName }), // Only update if userName is provided
        ...(dateOfBirth && { dateOfBirth }), // Only update if dateOfBirth is provided
      });

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
    const userId = req.params.userId; // Extract user ID from URL
    await db.collection("users").doc(userId).delete(); // Delete user document from Firestore

    res.status(200).send({ message: "User deleted successfully" }); // Send success response
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Handler to get all users
exports.getAllUsers = async (req, res) => {
  try {
    const usersSnapshot = await db.collection("users").get(); // Get all user documents from Firestore

    // Check if there are no users
    if (usersSnapshot.empty) {
      return res.status(404).send({ message: "No users found" });
    }

    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })); // Format each document to include ID

    res.status(200).send(users); // Send array of user objects as response
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Internal Server Error");
  }
};