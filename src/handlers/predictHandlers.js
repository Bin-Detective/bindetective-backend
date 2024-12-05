const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { getAuth } = require("firebase-admin/auth");
const { FieldValue } = require("firebase-admin/firestore");
const fs = require("fs");
const { predictImage } = require("../middleware/restClient");

// Handler to predict image
exports.handleImagePredict = async (req, res) => {
  console.log("Starting image prediction...");

  // Check if an image file is provided
  if (!req.file) {
    console.log("No image file provided");
    return res.status(400).send({ message: "No image file provided" });
  }

  // Define the path and filename for the uploaded image
  const imagePath = req.file.path;
  const tempFileName = `${uuidv4()}${path.extname(req.file.originalname)}`;
  const tempDestination = `tempImages/${tempFileName}`;

  try {
    console.log("Uploading image to temporary folder...");

    // Upload the image to the temporary folder
    await global.bucket.upload(imagePath, {
      destination: tempDestination,
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    console.log("Image uploaded to temporary folder:", tempDestination);

    // Get the public URL of the uploaded image from the temporary folder
    const tempFile = global.bucket.file(tempDestination);
    const [tempUrl] = await tempFile.getSignedUrl({
      action: "read",
      expires: "03-01-2500", // Set a far future expiration date
    });

    console.log("Temporary URL generated:", tempUrl);

    // Call the FastAPI service to predict the image using the temporary URL
    const prediction = await predictImage(tempUrl);

    // Check if the prediction response is valid
    if (!prediction || !prediction.predicted_class) {
      throw new Error("Invalid prediction response");
    }

    console.log("Prediction successful:", prediction);

    // Define the permanent destination for the image
    const permanentFileName = `${uuidv4()}${path.extname(
      req.file.originalname,
    )}`;
    const permanentDestination = `predictedUploads/${permanentFileName}`;

    // Move the image to the permanent folder
    await tempFile.move(permanentDestination);

    console.log("Image moved to permanent folder:", permanentDestination);

    // Get the public URL of the uploaded image from the permanent folder
    const permanentFile = global.bucket.file(permanentDestination);
    const [permanentUrl] = await permanentFile.getSignedUrl({
      action: "read",
      expires: "03-01-2500", // Set a far future expiration date
    });

    console.log("Permanent URL generated:", permanentUrl);

    const userId = "u7pzdJ3XGsNrtoQqx5ujUXqYOoJ3";

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

    console.log("Prediction result stored in Firestore:", predictHistoryRef.id);

    // Add the document ID to the user's 'predictCollection' array in Firestore
    const userRef = global.db.collection("users").doc(userId);
    await userRef.update({
      predictCollection: FieldValue.arrayUnion(predictHistoryRef.id),
    });

    console.log("Prediction result added to user's predictCollection:", userId);

    // Send the prediction response back to the client
    res.status(200).send({
      imageUrl: permanentUrl, // URL of the uploaded image
      predicted_class: prediction.predicted_class, // Predicted class of the image
      waste_type: prediction.waste_type, // Type of waste
      probabilities: prediction.probabilities, // Probabilities for all classes
    });

    console.log("Prediction response sent to client");

    // Delete the temporary file after sending the response
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Error deleting temporary file:", err);
      } else {
        console.log("Temporary file deleted:", imagePath);
      }
    });
  } catch (error) {
    console.error("Error during image prediction:", error);

    // Delete the image from the temporary folder if the prediction call fails
    const tempFile = global.bucket.file(tempDestination);
    tempFile.delete().catch((err) => {
      console.error("Error deleting file from temporary folder:", err);
    });

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
    console.log("Fetching all prediction history...");
    const snapshot = await global.db.collection("predict_history").get();
    const predictHistory = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("Prediction history fetched successfully");
    res.status(200).send({ predictHistory });
  } catch (error) {
    console.error("Error fetching prediction history:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};
