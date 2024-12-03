const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { getAuth } = require("firebase-admin/auth");
const { FieldValue } = require("firebase-admin/firestore");
const fs = require("fs");
const { predictImage } = require("../middleware/restClient");

// Handler to predict image
exports.handleImagePredict = async (req, res) => {
  // Check if an image file is provided
  if (!req.file) {
    return res.status(400).send({ message: "No image file provided" });
  }

  // Extract the user's token from the Authorization header
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  if (!idToken) {
    return res.status(401).send({ message: "Unauthorized: No token provided" });
  }

  let userId;
  try {
    // Verify the user's token and extract the user ID
    const decodedToken = await getAuth().verifyIdToken(idToken);
    userId = decodedToken.uid;
  } catch (error) {
    return res.status(401).send({ message: "Unauthorized: Invalid token" });
  }

  // Define the path and filename for the uploaded image
  const imagePath = req.file.path;
  const tempFileName = `${uuidv4()}${path.extname(req.file.originalname)}`;
  const tempDestination = `tempImages/${tempFileName}`;

  try {
    // Upload the image to the temporary folder
    await global.bucket.upload(imagePath, {
      destination: tempDestination,
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    // Get the public URL of the uploaded image from the temporary folder
    const tempFile = global.bucket.file(tempDestination);
    const [tempUrl] = await tempFile.getSignedUrl({
      action: "read",
      expires: "03-01-2500", // Set a far future expiration date
    });

    // Call the FastAPI service to predict the image using the temporary URL
    const prediction = await predictImage(tempUrl);

    // Check if the prediction response is valid
    if (!prediction || !prediction.predicted_class) {
      throw new Error("Invalid prediction response");
    }

    // Define the permanent destination for the image
    const permanentFileName = `${uuidv4()}${path.extname(
      req.file.originalname
    )}`;
    const permanentDestination = `predictedUploads/${permanentFileName}`;

    // Move the image to the permanent folder
    await tempFile.move(permanentDestination);

    // Get the public URL of the uploaded image from the permanent folder
    const permanentFile = global.bucket.file(permanentDestination);
    const [permanentUrl] = await permanentFile.getSignedUrl({
      action: "read",
      expires: "03-01-2500", // Set a far future expiration date
    });

    // Store the prediction result in the Firestore 'predict_history' collection
    const predictHistoryRef = global.db.collection("predict_history").doc();
    await predictHistoryRef.set({
      imageUrl: permanentUrl, // URL of the uploaded image
      predicted_class: prediction.predicted_class, // Predicted class of the image
      waste_type: prediction.waste_type, // Type of waste
      probabilities: prediction.probabilities, // Probabilities for all classes
      timestamp: new Date(), // Timestamp of the prediction
      userId: userId, // ID of the user who made the prediction
    });

    // Add the document ID to the user's 'predictCollection' array in Firestore
    const userRef = global.db.collection("users").doc(userId);
    await userRef.update({
      predictCollection: FieldValue.arrayUnion(predictHistoryRef.id),
    });

    // Send the prediction response back to the client
    res.status(200).send({
      imageUrl: permanentUrl, // URL of the uploaded image
      predicted_class: prediction.predicted_class, // Predicted class of the image
      waste_type: prediction.waste_type, // Type of waste
      probabilities: prediction.probabilities, // Probabilities for all classes
    });

    // Delete the temporary file after sending the response
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Error deleting temporary file:", err);
      }
    });
  } catch (error) {
    // Delete the image from the temporary folder if the prediction call fails
    const tempFile = global.bucket.file(tempDestination);
    tempFile.delete().catch((err) => {
      console.error("Error deleting file from temporary folder:", err);
    });

    // Temporarily disable file deletion in case of error
    // fs.unlink(imagePath, (err) => {
    //   if (err) {
    //     console.error("Error deleting temporary file:", err);
    //   }
    // });

    // Check for specific error types and respond accordingly
    if (error.code === "storage/unauthorized") {
      return res
        .status(403)
        .send({ message: "Forbidden: Unauthorized access to storage" });
    } else if (error.code === "storage/canceled") {
      return res
        .status(408)
        .send({ message: "Request Timeout: Upload canceled" });
    } else if (error.code === "storage/unknown") {
      return res
        .status(500)
        .send({ message: "Internal Server Error: Unknown storage error" });
    } else {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }
};

// Handler to list all documents in the 'predict_history' collection
exports.getAllPredictHistory = async (req, res) => {
  try {
    const snapshot = await global.db.collection("predict_history").get();
    const predictHistory = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).send({ predictHistory });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};
