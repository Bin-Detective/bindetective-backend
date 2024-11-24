const { predictImage } = require("../middleware/grpcClient");
const PAth = require("path");
const { v4: uuidv4 } = require("uuid");
const { getAuth } = require("firebase-admin/auth");
const { FieldValue } = require("firebase-admin/firestore");

exports.ImagePredict = async (req, res) => {
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
    console.error("Error verifying token:", error);
    return res.status(401).send({ message: "Unauthorized: Invalid token" });
  }

  // Define the path and filename for the uploaded image
  const imagePath = req.file.PAth;
  const fileName = `${uuidv4()}${PAth.extname(req.file.originalname)}`;
  const destination = `predictedUploads/${fileName}`;

  try {
    // Upload the image to the Firebase Storage bucket
    await global.bucket.upload(imagePath, {
      destination: destination,
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    // Get the public URL of the uploaded image
    const file = global.bucket.file(destination);
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: "03-01-2500", // Set a far future expiration date
    });

    // Call the gRPC client to predict the image
    predictImage(imagePath, async (error, response) => {
      if (error) {
        console.error("Error predicting image:", error);
        return res
          .status(500)
          .send({ message: "Internal Server Error: Prediction failed" });
      }

      // Store the prediction result in the Firestore 'predict_history' collection
      const predictHistoryRef = global.db.collection("predict_history").doc();
      await predictHistoryRef.set({
        imageUrl: url, // URL of the uploaded image
        predicted_class: response.predicted_class, // Predicted class of the image
        waste_type: response.waste_type, // Type of waste
        probabilities: response.probabilities, // Probabilities for all classes
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
        imageUrl: url, // URL of the uploaded image
        predicted_class: response.predicted_class, // Predicted class of the image
        waste_type: response.waste_type, // Type of waste
        probabilities: response.probabilities, // Probabilities for all classes
      });
    });
  } catch (error) {
    console.error("Error processing request:", error);

    // Delete the temporary uploaded file in case of error
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Error deleting temporary file:", err);
      } else {
        console.log("Temporary file deleted:", imagePath);
      }
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
    const snapshot = await global.db.collection("predict_history").get();
    const predictHistory = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).send({ predictHistory });
  } catch (error) {
    console.error("Error listing predict history:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};
