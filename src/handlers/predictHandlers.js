const { predictImage } = require("../middleware/grpcClient");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

exports.handleImagePredict = async (req, res) => {
  // Check if an image file is provided
  if (!req.file) {
    return res.status(400).send({ message: "No image file provided" });
  }

  const imagePath = req.file.path;
  const fileName = `${uuidv4()}${path.extname(req.file.originalname)}`;
  const destination = `predictedUploads/${fileName}`;

  try {
    // Upload the image to the bucket
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
        console.error("Error:", error);
        return res.status(500).send({ message: "Internal Server Error" });
      }

      // Store the prediction result in Firestore
      const predictHistoryRef = global.db.collection("predict_history").doc();
      await predictHistoryRef.set({
        imageUrl: url,
        predicted_class: response.predicted_class,
        waste_type: response.waste_type,
        probabilities: response.probabilities,
        timestamp: new Date(),
      });

      // Send the prediction response
      res.status(200).send({
        imageUrl: url,
        predicted_class: response.predicted_class,
        waste_type: response.waste_type,
        probabilities: response.probabilities,
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};
